"use client";
import React from "react";
import axios from "axios";
import { useAccount, usePublicClient, useWriteContract } from "wagmi"; //* connected account, read-only blockchain calls, write blockchain calls
import { parseEther, formatEther, parseEventLogs } from "viem"; //* eth->wei, wei->eth, parse event logs from blockchain
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "./constants";
export const NFTMarketplaceContext = React.createContext(); //* pass everything instead of one by one

export const NFTMarketplaceProvider = ({ children }) => {
  const { address } = useAccount(); //* connected user address
  const publicClient = usePublicClient(); //* read-only EVM client for readContract
  const { writeContractAsync } = useWriteContract(); //* writeContract

    //$ get users balance
  const getBalance = async () => {
    //* validation
    if (!address) throw new Error("Please connect a wallet first.");

    return await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "getUserBalanceOf",
      args: [address],
    }); //* call on-chain function
  };

  //$ withdraw
  const withdraw = async ({ amountEth }) => {
    //* validation
    if (!address) throw new Error("Please connect a wallet first.");
    if (!amountEth) throw new Error("amountEth required");

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "withdraw",
      args: [parseEther(String(amountEth))], //* convert eth to wei
    });//* call on-chain function
    await publicClient.waitForTransactionReceipt({ hash }); //* wait for transaction to finish
    return hash;
  };

    //$ fetch user NFTs/listings
  const fetchMyNFTs = async () => {
    try {
      //* validation
      if (!address) throw new Error("Please connect a wallet first.");

      const data = await publicClient.readContract({
        address: NFTMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "fetchMyNFTs",
        account: address,
      }); //* on-chain call

      //* circulate on-chain data
      const items = await Promise.all(
        //* map fetched on-chain data
        data.map(async (item) => {
          const tokenId = Number(item.tokenId);
          const tokenURI = await publicClient.readContract({
            address: NFTMarketplaceAddress,
            abi: NFTMarketplaceABI,
            functionName: "tokenURI",
            args: [BigInt(tokenId)],
          }); //* get token pinata(data) url

          let meta = {};
          try {
            const res = await axios.get(tokenURI); //* get token data from pinata
            meta = res?.data || {};
          } catch (e) {
            console.warn("tokenURI fetch failed:", tokenURI, e);
          }

          return {
            tokenId,
            seller: item.seller,
            owner: item.owner,
            price: Number(formatEther(item.price)),
            image: meta.image,
            name: meta.name,
            description: meta.description,
            tokenURI,
          };
        })
      );

      return items;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      return [];
    }
  };

    //$ create listing
  const createSale = async (url, formInputPrice, dbPayload) => {
    //* Validation
    if (!address) throw new Error("Please connect a wallet first.");

    const price = parseEther(String(formInputPrice)); //* convert eth to wei
    const listingFee = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "listingFeeFor",
      args: [price],
    }); //* get listing fee

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "createToken",
      args: [url, price],
      value: listingFee,
    }); //* call on-chain function
    const receipt = await publicClient.waitForTransactionReceipt({ hash }); //* wait for transaction to finish

    const logs = parseEventLogs({
      abi: NFTMarketplaceABI,
      logs: receipt.logs,
      eventName: "MarketItemCreated",
    }); //*  check on-chain createNFT log
    const tokenIdFromEvent = logs?.[0]?.args?.tokenId; //* get tokenId from first event from logs
    if (tokenIdFromEvent !== undefined) {
      const tokenIdNum = Number(tokenIdFromEvent);

      //* DB update
      if (dbPayload) {
        //* destructure dbPayload
        const {
          name,
          description,
          imageUrl,
          metadataUrl,
          width,
          height,
          size,
          category,
        } = dbPayload;

        //* save to db via api
        const saveRes = await fetch("/api/create-nft/save-nft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenId: tokenIdNum,
            name,
            description,
            imageUrl,
            metadataUrl: metadataUrl ?? url,
            width,
            height,
            size,
            price: String(formInputPrice),
            category,
            address: address,
            marketplaceAddress: NFTMarketplaceAddress,
            txHash: hash,
          }),
        });
        const saveData = await saveRes.json().catch(() => ({}));

        if (!saveRes.ok)
          throw new Error(saveData?.error || "Save to database failed");
      }

      //* update contract balance
      // try {
      //   const contractBalance = await publicClient.readContract({
      //     address: NFTMarketplaceAddress,
      //     abi: NFTMarketplaceABI,
      //     functionName: "getBalance",
      //   });
      //   console.log("Contract balance after sale:", formatEther(contractBalance));
      // } catch {}

      return tokenIdNum;
    }
    throw new Error("Failed to parse tokenId from MarketItemCreated event");
  };

    //$ buy NFT
  const buyNFT = async ({ tokenId, price }) => {
    //* validation
    if (!address) throw new Error("Please connect a wallet first.");
    if (tokenId === undefined || tokenId === null)
      throw new Error("tokenId required");
    if (price === undefined || price === null)
      throw new Error("price required");

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "createMarketSale",
      args: [BigInt(tokenId)],
      value: parseEther(String(price)), //* convert eth to wei
    }); //* call on-chain function
    await publicClient.waitForTransactionReceipt({ hash }); //* wait for transaction to finish

    //* DB update
    const res = await fetch("/api/buy-nft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenId: Number(tokenId),
        buyerAddress: address,
        price: String(price),
        txHash: hash,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(data?.error || "Failed to update DB after purchase");

    return hash;
  };

  //$ cancel listing
  const cancelListing = async (nft) => {
    //* validation
    if (!address) throw new Error("Please connect a wallet first.");

    const fee = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "listingFeeFor",
      args: [parseEther(String(nft.price))],
    }); //* get listing fee

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "cancelListing",
      args: [BigInt(nft.tokenId)],
      value: fee,
    }); //* call on-chain function
    await publicClient.waitForTransactionReceipt({ hash });

    //* DB update
    await fetch("/api/cancel-sell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenId: Number(nft.tokenId),
        walletAddress: address,
        txHash: hash,
      }),
    }).catch(console.error);

    return hash;
  };


  //$ check if contract can get users NFTs
  const ensureApprovalForAll = async () => {
    //* validation
    if (!address) throw new Error("Please connect a wallet first.");

    //* check if contract is already approved
    const alreadyApproved = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "isApprovedForAll",
      args: [address, NFTMarketplaceAddress],
    });

    //* not approved
    if (!alreadyApproved) {
      const hash = await writeContractAsync({
        address: NFTMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "setApprovalForAll",
        args: [NFTMarketplaceAddress, true],
      }); //* call on-chain function for approval
      await publicClient.waitForTransactionReceipt({ hash });
    }
  };

  //$ Resell NFT
  const resellNFT = async ({ tokenId, priceEth, category }) => {
    //* validation
    if (!address) throw new Error("Please connect a wallet first.");
    if (tokenId === undefined || tokenId === null)
      throw new Error("tokenId required");
    if (!priceEth) throw new Error("priceEth required");

    const priceWei = parseEther(String(priceEth)); //* convert eth to wei
    const listingFee = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "listingFeeFor",
      args: [priceWei],
    }); //* get listing fee

    await ensureApprovalForAll(); //* check if contract can get users NFTs

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "resellToken",
      args: [BigInt(tokenId), priceWei],
      value: listingFee,
    }); //* call on-chain function
    await publicClient.waitForTransactionReceipt({ hash }); //* wait for transaction to finish

    //* make changes to db via api
    await fetch("/api/resell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenId: Number(tokenId),
        price: String(priceEth),
        walletAddress: address,
        txHash: hash,
        category,
      }),
    }).catch(console.error);
    return hash;
  };

  return (
    <NFTMarketplaceContext.Provider
      value={{
        createSale,
        fetchMyNFTs,
        buyNFT,
        cancelListing,
        resellNFT,
        getBalance,
        withdraw,
      }}>
      {children}
    </NFTMarketplaceContext.Provider>
  );
};

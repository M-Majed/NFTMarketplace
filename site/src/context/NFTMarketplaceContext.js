// src/context/NFTMarketplaceContext.js
"use client";

import React from "react";
import axios from "axios";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { parseEther, formatEther, parseEventLogs } from "viem";
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "./constants";

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = ({ children }) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  // Ensure the marketplace (this contract) is approved to transfer the user's NFTs
  const ensureApprovalForAll = async () => {
    if (!address) throw new Error("Please connect a wallet first.");

    const alreadyApproved = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "isApprovedForAll",
      args: [address, NFTMarketplaceAddress],
      // account not strictly required for a pure read, but harmless
    });

    if (!alreadyApproved) {
      const hash = await writeContractAsync({
        address: NFTMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "setApprovalForAll",
        args: [NFTMarketplaceAddress, true],
      });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  };

  // Resell an owned NFT: on-chain + DB
  const resellNFT = async ({ tokenId, priceEth, category }) => {
    if (!address) throw new Error("Please connect a wallet first.");
    if (tokenId === undefined || tokenId === null)
      throw new Error("tokenId required");
    if (!priceEth) throw new Error("priceEth required");

    const listingPrice = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "getListingPrice",
    });

    await ensureApprovalForAll();

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "resellToken",
      args: [BigInt(tokenId), parseEther(String(priceEth))],
      value: listingPrice,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    // Persist to DB
    await fetch("/api/resell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenId: Number(tokenId),
        price: String(priceEth),
        walletAddress: address,
        txHash: hash,
        category,
        marketplaceAddress: NFTMarketplaceAddress,
      }),
    }).catch(console.error);

    return hash;
  };

  const createSale = async (url, formInputPrice, isReselling, tokenId) => {
    if (!address) throw new Error("Please connect a wallet first.");
    const price = parseEther(String(formInputPrice));

    const listingPrice = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "getListingPrice",
    });

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "createToken",
      args: [url, price],
      value: listingPrice,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Optional: check contract balance if you still want this log
    try {
      const contractBalance = await publicClient.readContract({
        address: NFTMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "getBalance",
      });
      console.log("Contract balance after sale:", formatEther(contractBalance));
    } catch {}

    if (!isReselling) {
      // Parse the tokenId from the MarketItemCreated event
      const logs = parseEventLogs({
        abi: NFTMarketplaceABI,
        logs: receipt.logs,
        eventName: "MarketItemCreated",
      });
      const tokenIdFromEvent = logs?.[0]?.args?.tokenId;
      if (tokenIdFromEvent !== undefined) return Number(tokenIdFromEvent);
      throw new Error("Failed to parse tokenId from MarketItemCreated event");
    }
  };

  const fetchMyNFTsOrListedNFTs = async (type = "MyNFTs") => {
    try {
      if (type === "ListedNFTs") {
        const res = await fetch("/api/fetch-nfts", { cache: "no-store" });
        return await res.json();
      }

      if (!address) throw new Error("Please connect a wallet first.");

      // This view relies on msg.sender; pass `account` so the call is simulated "from" the user
      const data = await publicClient.readContract({
        address: NFTMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: "fetchMyNFTs",
        account: address,
      });

      const items = await Promise.all(
        data.map(async (item) => {
          const tokenId = Number(item.tokenId);

          const tokenURI = await publicClient.readContract({
            address: NFTMarketplaceAddress,
            abi: NFTMarketplaceABI,
            functionName: "tokenURI",
            args: [BigInt(tokenId)],
          });

          let meta = {};
          try {
            const res = await axios.get(tokenURI);
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

  const buyNFT = async (nft) => {
    if (!address) throw new Error("Please connect a wallet first.");
    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "createMarketSale",
      args: [BigInt(nft.tokenId)],
      value: parseEther(String(nft.price)),
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  };

  const cancelListing = async (nft) => {
    if (!address) throw new Error("Please connect a wallet first.");

    const fee = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "getListingPrice",
    });

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "cancelListing",
      args: [BigInt(nft.tokenId)],
      value: fee,
    });
    await publicClient.waitForTransactionReceipt({ hash });

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

  // ---- New: fees & balances API ----
  const getPendingBalance = async (addr) => {
    const who = addr ?? address;
    if (!who) throw new Error("Please connect a wallet first.");
    return await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "pendingBalanceOf",
      args: [who],
    });
  };

  const withdraw = async ({ amountEth }) => {
    if (!address) throw new Error("Please connect a wallet first.");
    if (!amountEth) throw new Error("amountEth required");
    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: "withdraw",
      args: [parseEther(String(amountEth))],
    });
    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  };

  return (
    <NFTMarketplaceContext.Provider
      value={{
        createSale,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
        cancelListing,
        resellNFT,
        getPendingBalance,
        withdraw,
      }}>
      {children}
    </NFTMarketplaceContext.Provider>
  );
};

// src/context/NFTMarketplaceContext.js
"use client";
import React, { useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "./constants";
import axios from "axios";

const connectingWithSmartContract = async () => {
  try {
    const web3Modal = new Web3Modal();
    const conn = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(conn);
    const signer = await provider.getSigner();
    return {
      readContract: new ethers.Contract(
        NFTMarketplaceAddress,
        NFTMarketplaceABI,
        provider
      ),
      writeContract: new ethers.Contract(
        NFTMarketplaceAddress,
        NFTMarketplaceABI,
        signer
      ),
    };
  } catch (error) {
    console.error("Error connecting with smart contract:", error);
  }
};

export const NFTMarketplaceContext = React.createContext();

export const NFTMarketplaceProvider = ({ children }) => {
  // Ensures the marketplace (this contract) is approved to transfer the user's NFTs
  const ensureApprovalForAll = async () => {
    const { writeContract } = await connectingWithSmartContract();

    // ethers v6: signer address lives on the runner behind the contract
    const ownerAddress = await writeContract.runner.getAddress();

    // Is the contract already approved as operator?
    const alreadyApproved = await writeContract.isApprovedForAll(
      ownerAddress,
      NFTMarketplaceAddress
    );

    if (!alreadyApproved) {
      const tx = await writeContract.setApprovalForAll(
        NFTMarketplaceAddress,
        true
      );
      await tx.wait();
    }
  };

  const createSale = async (url, formInputPrice, isReselling, tokenId) => {
    try {
      const price = ethers.parseUnits(formInputPrice, "ether");
      const { readContract, writeContract } =
        await connectingWithSmartContract();
      const listingPrice = await readContract.getListingPrice();

      const tx = !isReselling
        ? // MINT & LIST (no approval needed here)
          await writeContract.createToken(url, price, { value: listingPrice })
        : // RESELL (requires approval once)
          (await ensureApprovalForAll(),
          await writeContract.resellToken(tokenId, price, {
            value: listingPrice,
          }));

      const receipt = await tx.wait();

      const contractBalance = await readContract.getBalance();
      console.log(
        "Contract balance after sale:",
        ethers.formatEther(contractBalance)
      );

      if (!isReselling) {
        const iface = writeContract.interface;
        let parsedLog;
        for (const log of receipt.logs) {
          try {
            parsedLog = iface.parseLog(log);
            if (parsedLog.name === "MarketItemCreated") {
              return parsedLog.args.tokenId;
            }
          } catch {}
        }
        if (!parsedLog) throw new Error("Failed to parse tokenId from event");
      }
    } catch (error) {
      console.error("Error creating sale:", error);
    }
  };

  const fetchMyNFTsOrListedNFTs = async (type = "MyNFTs") => {
    try {
      const { readContract, writeContract } =
        await connectingWithSmartContract();

      if (type === "ListedNFTs") {
        // Use your backend instead (replace with your actual route)
        const res = await fetch("/api/fetch-nfts", { cache: "no-store" });
        const listed = await res.json();
        return listed;
      }

      // "MyNFTs" comes from SC (relies on msg.sender, so use writeContract)
      const data = await writeContract.fetchMyNFTs();

      const items = await Promise.all(
        data.map(async (item) => {
          const tokenId = Number(item.tokenId);
          const tokenURI = await readContract.tokenURI(tokenId);

          // Be defensive when fetching off-chain metadata
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
            price: Number(ethers.formatUnits(item.price, "ether")),
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
    try {
      const { readContract, writeContract } =
        await connectingWithSmartContract();
      const price = ethers.parseUnits(nft.price.toString(), "ether");
      const transaction = await writeContract.createMarketSale(nft.tokenId, {
        value: price,
      });
      await transaction.wait();
      return transaction.hash;
    } catch (error) {
      console.error("Error buying NFT:", error);
    }
  };

  const cancelListing = async (nft) => {
    try {
      const { readContract, writeContract } =
        await connectingWithSmartContract();

      // Get the required cancellation fee from the contract
      const fee = await readContract.getListingPrice();

      // Send tx to cancel on-chain (fee goes to the contract balance)
      const tx = await writeContract.cancelListing(nft.tokenId, { value: fee });
      const receipt = await tx.wait();

      // Update DB
      const web3Modal = new Web3Modal();
      const conn = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(conn);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      await fetch("/api/cancel-sell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: Number(nft.tokenId),
          walletAddress,
          txHash: tx.hash ?? receipt?.transactionHash ?? null,
        }),
      }).catch(console.error);

      return tx.hash ?? receipt?.transactionHash ?? null;
    } catch (error) {
      console.error("cancelListing failed:", error);
      throw error;
    }
  };

  return (
    <NFTMarketplaceContext.Provider
      value={{
        createSale,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
        cancelListing,
      }}>
      {children}
    </NFTMarketplaceContext.Provider>
  );
};

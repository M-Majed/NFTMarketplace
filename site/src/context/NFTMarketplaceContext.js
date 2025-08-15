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
  
  const createSale = async (url, formInputPrice, isReselling, tokenId) => {
    try {
      const price = ethers.parseUnits(formInputPrice, "ether");
      const { readContract, writeContract } =
        await connectingWithSmartContract();
      const listingPrice = await readContract.getListingPrice();

      const tx = !isReselling
        ? // mint & list
          await writeContract.createToken(url, price, { value: listingPrice })
        : // resell existing token (use tokenId, not url!)
          await writeContract.resellToken(tokenId, price, {
            value: listingPrice,
          });
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
        if (!parsedLog) {
          throw new Error("Failed to parse tokenId from event");
        }
      }
    } catch (error) {
      console.error("Error creating sale:", error);
    }
  };

  const fetchMyNFTsOrListedNFTs = async (type = "MyNFTs") => {
    try {
      const { readContract, writeContract } = await connectingWithSmartContract();
      // Use signer-bound contract for view functions that rely on msg.sender
      const view = writeContract;
      const data =
        type === "ListedNFTs"
          ? await view.fetchItemsListed()
          : await view.fetchMyNFTs();

      const items = await Promise.all(
        data.map(async (item) => {
          const tokenId = Number(item.tokenId);
          const tokenURI = await readContract.tokenURI(tokenId);
          const res = await axios.get(tokenURI);
          const { image, description, name } = res.data ?? {};

          return {
            tokenId,
            seller: item.seller,
            owner: item.owner,
            price: Number(ethers.formatUnits(item.price, "ether")),
            image,
            name,
            description,
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
    const { readContract, writeContract } = await connectingWithSmartContract();

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

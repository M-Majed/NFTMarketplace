// src/context/NFTMarketplaceContext.js
"use client";
import React from "react";
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

  const fetchMyNFTsOrListedNFTs = async (type) => {
    try {
      const { readContract } = await connectingWithSmartContract();
      const data =
        type == "ListedNFTs"
          ? await readContract.fetchItemsListed()
          : await readContract.fetchMyNFTs();
      const items = await Promise.all(
        data.map(
          async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await readContract.tokenURI(tokenId);
            const {
              data: { image, description, name },
            } = await axios.get(tokenURI);
            const price = ethers.utils.formatUnits(
              unformattedPrice.toString(),
              "ether"
            );
            return {
              price,
              tokenId: tokenId.tonumber(),
              seller,
              owner,
              image,
              name,
              description,
              tokenURI,
            };
          }
        )
      );
      return items;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  const buyNFT = async (nft) => {
    try {
      const contract = await connectingWithSmartContract();
      const price = ethers.parseUnits(nft.price.toString(), "ether");
      const transaction = await contract.createMarketSale(nft.tokenId, {
        value: price,
      });
      await transaction.wait();
    } catch (error) {
      console.error("Error buying NFT:", error);
    }
  };

  return (
    <NFTMarketplaceContext.Provider
      value={{
        createSale,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
      }}>
      {children}
    </NFTMarketplaceContext.Provider>
  );
};

"use client";
import React, { useState, useEffect, useContext } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "./constants";
import axios from "axios";

const fetchContract = (signerOrProvider) =>
  new ethers.Contract(
    NFTMarketplaceAddress,
    NFTMarketplaceABI,
    signerOrProvider
  );

const connectingWithSmartContract = async () => {
  try {
    const web3Modal = new Web3Modal();
    const conn = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(conn);
    const signer = await provider.getSigner();
    const contract = fetchContract(signer);
    return {
      // provider-backed instance for view methods
      readContract: new ethers.Contract(
        NFTMarketplaceAddress,
        NFTMarketplaceABI,
        provider
      ),
      // signer-backed instance for transactions
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

  const uploadToIPFS = async (file) => {
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `4debc3fcabe5bbd80adf`,
            pinata_secret_api_key: `9504cf1f418af404f1bcd48e3380f592ae718a240c4963b6b02c61c2f2e55cd0`,
            "Content-Type": "multipart/form-data",
          },
        });
        const ImgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        return ImgHash;
      } catch (error) {
        console.error("Error adding data to IPFS:", error);
      }
    }
  };

  const createNFT = async (name, price, image, description, router) => {
    if (!name || !description || !price || !image)
      alert("Please fill all required fields");
    const data = JSON.stringify({ name, description, image });
    try {
      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: `4debc3fcabe5bbd80adf`,
          pinata_secret_api_key: `9504cf1f418af404f1bcd48e3380f592ae718a240c4963b6b02c61c2f2e55cd0`,
          "Content-Type": "application/json",
        },
      });
      const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      console.log(url);
      await createSale(url, price);
    } catch (error) {
      console.error("Error adding data to IPFS:", error);
    }
  };

  const createSale = async (url, formInputPrice, isReselling, id) => {
    try {
      console.log("createSale", url, formInputPrice, isReselling, id);
      const price = ethers.parseUnits(formInputPrice, "ether");
      const { readContract, writeContract } =
        await connectingWithSmartContract();
      const listingPrice = await readContract.getListingPrice();

    const tx = !isReselling
      // mint & list
      ? await writeContract.createToken(url, price, { value: listingPrice })
      // resell existing token (use tokenId, not url!)
      : await writeContract.resellToken(tokenId, price, { value: listingPrice });


      await tx.wait();
          const contractBalance = await readContract.getBalance();
    console.log("Contract balance after sale:", ethers.formatEther(contractBalance));

    } catch (error) {
      console.error("Error creating sale:", error);
    }
  };

  const fetchNFTs = async () => {
    try {
      const provider = new ethers.providers.JsonRPCProvider();
      const contract = fetchContract(provider);
      const data = await contract.getMarketItem();
      const items = await Promise.all(
        data.map(
          async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await contract.tokenURI(tokenId);

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

  const fetchMyNFTsOrListedNFTs = async (type) => {
    try {
      const contract = await connectingWithSmartContract();
      const data =
        type == "fetchItemsListed"
          ? await contract.fetchItemsListed()
          : await contract.fetchMyNFT();
      const items = await Promise.all(
        data.map(
          async ({ tokenId, seller, owner, price: unformattedPrice }) => {
            const tokenURI = await contract.tokenURI(tokenId);
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
      const price = ethers.utils.parseUnits(nft.price.toString(), "ether");
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
        uploadToIPFS,
        createNFT,
        createSale,
        fetchNFTs,
        fetchMyNFTsOrListedNFTs,
        buyNFT,
      }}>
      {children}
    </NFTMarketplaceContext.Provider>
  );
};

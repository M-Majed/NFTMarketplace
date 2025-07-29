"use client";
import React, { useState, useEffect, useContext } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";
import {
  MarketplaceAddress,
  MarketplaceABI,
  NFTAddress,
  NFTABI,
} from "./constants";
import axios from "axios";

const fetchMarketContract = (signerOrProvider) =>
  new ethers.Contract(MarketplaceAddress, MarketplaceABI, signerOrProvider);
const fetchNFTContract = (signerOrProvider) =>
  new ethers.Contract(NFTAddress, NFTABI, signerOrProvider);

const connectingWithSmartContract = async () => {
  try {
    const web3Modal = new Web3Modal();
    const conn = await web3Modal.connect();
    const provider = new ethers.BrowserProvider(conn);
    const signer = await provider.getSigner();
    const Marketcontract = fetchMarketContract(signer);
    const NFTcontract = fetchNFTContract(signer);
    return {
      readMarketContract: new ethers.Contract(
        MarketplaceAddress,
        MarketplaceABI,
        provider
      ),
      writeMarketContract: new ethers.Contract(
        MarketplaceAddress,
        MarketplaceABI,
        signer
      ),

      readNFTContract: new ethers.Contract(NFTAddress, NFTABI, provider),
      writeNFTContract: new ethers.Contract(NFTAddress, NFTABI, signer),
    };
  } catch (error) {
    console.error("Error connecting with smart contracts:", error);
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

  const createToken = async (name, image, description) => {
    if (!name || !description || !image)
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
      const { readNFTContract, writeNFTContract } =
        await connectingWithSmartContract();
      await writeNFTContract.createToken(url);
    } catch (error) {
      console.error("Error adding data to IPFS:", error);
    }
  };

  const createMarketplaceItem = async (tokenId, NFTprice) => {
    try {
      console.log("createSale", NFTAddress, tokenId, NFTprice);
      const price = ethers.parseUnits(NFTprice, "ether");
      const { readMarketContract, writeMarketContract } =
        await connectingWithSmartContract();
      const listingPrice = await readMarketContract.getListingPrice();

      const tx = await writeMarketContract.createMarketplaceItem(
        NFTAddress,
        tokenId,
        NFTprice,
        { value: listingPrice }
      );
      await tx.wait();

      // const contractBalance = await readMarketContract.getBalance();
      // console.log(
      //   "Contract balance after sale:",
      //   ethers.formatEther(contractBalance)
      // );
      console.log("Sale created successfully");
    } catch (error) {
      console.error("Error creating sale:", error);
    }
  };

  // const createMarketplaceSale = async (itemId) => {
  //   try {
  //     const { readMarketContract, writeMarketContract } =
  //       await connectingWithSmartContract();
  //     const tx = await writeMarketContract.createMarketplaceSale(
  //       NFTAddress,
  //       itemId,
  //       {
  //         value: listingPrice,
  //       }
  //     );
  //     await tx.wait();
  //     console.log("Sale done successfully");
  //   } catch (error) {
  //     console.error("Error sale not done:", error);
  //   }
  // };

  const fetchMarketplaceItems = async () => {
    try {
      const provider = new ethers.providers.JsonRPCProvider();
      const contract = fetchMarketContract(provider);
      let items = await contract.getMarketItem();
      items = await Promise.all(
        items.map(
          async(async (i) => {
            const tokenUri = await contract.tokenURI(i.tokenId);
            let item = {
              price: i.price.toString(),
              tokenId: i.tokenId.toString(),
              seller: i.seller,
              owner: i.owner,
              tokenUri,
            };
            return {
              item,
            };
          })
        )
      );
      return items;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

  const fetchMyNFTs = async () => {
    try {
      const contract = await connectingWithSmartContract();
      let items = await contract.fetchMyNFTs();
      items = await Promise.all(
        items.map(
          async(async (i) => {
            const tokenUri = await contract.tokenURI(i.tokenId);
            let item = {
              price: i.price.toString(),
              tokenId: i.tokenId.toString(),
              seller: i.seller,
              owner: i.owner,
              tokenUri,
            };
            return {
              item,
            };
          })
        )
      );
      items = items.concat(await fetchItemsCreated());
      return items;
    } catch (error) {
      console.error("Error fetching NFTs:", error);
    }
  };

    const fetchItemsCreated = async () => {
    try {
      const contract = await connectingWithSmartContract();
      let items = await contract.fetchItemsCreated();
      items = await Promise.all(
        items.map(
          async(async (i) => {
            const tokenUri = await contract.tokenURI(i.tokenId);
            let item = {
              price: i.price.toString(),
              tokenId: i.tokenId.toString(),
              seller: i.seller,
              owner: i.owner,
              tokenUri,
            };
            return {
              item,
            };
          })
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
      const transaction = await contract.createMarketplaceSale(NFTAddress, nft.itemId, {
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
        createToken,
        createMarketplaceItem,
        fetchMarketplaceItems,
        fetchMyNFTs,
        buyNFT,
      }}>
      {children}
    </NFTMarketplaceContext.Provider>
  );
};

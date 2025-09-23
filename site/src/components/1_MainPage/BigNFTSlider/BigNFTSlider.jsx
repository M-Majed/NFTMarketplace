"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import { TbArrowBigLeftLines, TbArrowBigRightLine } from "react-icons/tb";
import Style from "./BigNFTSilder.module.css";
import { useContext } from "react";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { categories } from "@/app/constants";

export default function BigNFTSilder({ listings }) {
  const { buyNFT } = useContext(NFTMarketplaceContext);
  const { address, isConnected } = useAccount(); //* get account from wagmi
  const [isBuying, setIsBuying] = useState(false);
  const router = useRouter();

  const handleBuy = async () => {
    if (isBuying) return; //* prevent double-clicks
    if (!isConnected) return alert("Connect your wallet first");
    const listing = listings[idx]; //* get current listing

    //* alert if owner wants to buy
    const isOwnerBuying =
      !!address &&
      !!listing?.seller?.walletAddress &&
      address.toLowerCase() === listing.seller.walletAddress.toLowerCase();
    if (isOwnerBuying) {
      alert("You can’t buy your own NFT.");
      return;
    }

    try {
      setIsBuying(true);
      //* on-chain + db buy function
      const txHash = await buyNFT({
        tokenId: listing.nft.tokenId,
        price: listing.price,
      });
      if (!txHash) throw new Error("Transaction failed");
      router.push("/");
    } catch (err) {
      alert("Buy failed: " + err.message);
    } finally {
      setIsBuying(false);
    }
  };
  const [idx, setIdx] = useState(0);

  //$ get slider data
  const sliderData = listings.map((item) => ({
    title: item.nft.name,
    name: item.seller.walletAddress,
    Category: item.category,
    priceEth: item.price,
    priceUsd: item.usdPrice,
    image: item.nft.imageUrl,
  }));

  //$ next/prev NFT
  const inc = useCallback(() => {
    if (idx + 1 < sliderData.length) setIdx(idx + 1);
  }, [idx, sliderData.length]);
  const dec = useCallback(() => {
    if (idx > 0) setIdx(idx - 1);
  }, [idx]);

  if (sliderData.length === 0) {
    return null;
  }

  //$ current NFT data
  const current = sliderData[idx];
  const Icon = categories.find((cat) => cat.category === current.Category).icon;


  const isOwnerViewing =
    !!address &&
    !!listings[idx]?.seller?.walletAddress &&
    address.toLowerCase() === listings[idx].seller.walletAddress.toLowerCase();

  return (
    <div className={Style.bigNFTSlider}>
      <div className={Style.bigNFTSlider_left}>
        <h2>{current.title}</h2>

        <div className={Style.bigNFTSlider_left_creator}>
          <div className={Style.bigNFTSlider_left_creator_profile}>
            <p>Creator</p>
            <h4>{current.name} </h4>
          </div>
          <div className={Style.bigNFTSlider_left_creator_Category}>
            <Icon
              className={Style.bigNFTSlider_left_creator_Category_icon}
            />
            <div className={Style.bigNFTSlider_left_creator_Category_info}>
              <p>Category</p>
              <h4>{current.Category}</h4>
            </div>
          </div>
        </div>
        <div className={Style.bigNFTSlider_left_bidding}>
          <div className={Style.bigNFTSlider_left_bidding_box}>
            <small>Price</small>
            <p>
              {current.priceEth} ETH&nbsp; <span>≈ ${current.priceUsd}</span>
            </p>
          </div>

          <div className={Style.bigNFTSlider_left_buttons}>
            <button
              className={Style.bigNFTSlider_left_buttons_button}
              onClick={handleBuy}
              disabled={isOwnerViewing || isBuying}>
              {isOwnerViewing ? "You can’t buy your own NFT" : "Buy"}
            </button>
            <button
              className={Style.bigNFTSlider_left_buttons_button}
              onClick={() => {
                window.location.href = `/nftdetails/${listings[idx].nft.tokenId}`;
              }}>
              View
            </button>
          </div>
        </div>

        <div className={Style.bigNFTSlider_left_sliderBtn}>
          <TbArrowBigLeftLines
            className={Style.bigNFTSlider_left_sliderBtn_icon}
            onClick={() => dec()}
          />
          <TbArrowBigRightLine
            className={Style.bigNFTSlider_left_sliderBtn_icon}
            onClick={() => inc()}
          />
        </div>
      </div>

      <div className={Style.bigNFTSlider_right}>
        <Image
          src={current.image}
          alt={current.name}
          width={400}
          height={400}
          className={Style.bigNFTSlider_right_box_img}
        />
      </div>
    </div>
  );
}

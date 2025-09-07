// src/components/1_MainPage/BigNFTSlider/BigNFTSlider.jsx
"use client";
import React, { useState, useEffect, useCallback, useContext } from "react";
import Image from "next/image";
import { AiFillFire, AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { MdVerified, MdTimer } from "react-icons/md";
import { TbArrowBigLeftLines, TbArrowBigRightLine } from "react-icons/tb";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

// INTERNAL IMPORT
import Style from "./BigNFTSilder.module.css";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";

export default function BigNFTSilder({ listings }) {
  const { buyNFT } = useContext(NFTMarketplaceContext);
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const handleBuy = async () => {
    if (!isConnected) return alert("Connect your wallet first");
    const listing = listings[idx];

    try {
      const txHash = await buyNFT({
        tokenId: listing.nft.tokenId,
        price: listing.price,
      });
      if (!txHash) throw new Error("Transaction failed");

      const res = await fetch("/api/buy-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: listing.nft.tokenId,
          buyerAddress: address,
          price: listing.price,
          txHash,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      router.push("/");
    } catch (err) {
      alert("Buy failed: " + err.message);
    }
  };

  const [idx, setIdx] = useState(0);

  // include both ETH and USD in each slide
  const sliderData = listings.map((item) => ({
    title: item.nft.name,
    name: item.seller.walletAddress,
    Category: item.category,
    priceEth: item.price,
    priceUsd: item.usdPrice,
    image: item.nft.imageUrl,
  }));

  const inc = useCallback(() => {
    if (idx + 1 < sliderData.length) setIdx(idx + 1);
  }, [idx, sliderData.length]);

  const dec = useCallback(() => {
    if (idx > 0) setIdx(idx - 1);
  }, [idx]);

  if (sliderData.length === 0) {
    return;
  }

  const current = sliderData[idx];

  return (
    <div className={Style.bigNFTSlider}>
      <div className={Style.bigNFTSlider_left}>
        <h2>{current.title}</h2>

        <div className={Style.bigNFTSlider_left_creator}>
          <div className={Style.bigNFTSlider_left_creator_profile}>
            {/* <Image ... /> */}
            <div className={Style.bigNFTSlider_left_creator_profile_info}>
              <p>Creator</p>
              <h4>{current.name} </h4>
            </div>
          </div>

          <div className={Style.bigNFTSlider_left_creator_Category}>
            <AiFillFire className={Style.bigNFTSlider_left_creator_Category_icon} />
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
            >
              Buy
            </button>
            <button
              className={Style.bigNFTSlider_left_buttons_button}
              onClick={() => {
                window.location.href = `/nftdetails/${listings[idx].nft.tokenId}`;
              }}
            >
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
        <div className={Style.bigNFTSlider_right_box}>
          <Image
            src={current.image}
            alt={current.name}
            width={400}
            height={400}
            className={Style.bigNFTSlider_right_box_img}
          />
        </div>
      </div>
    </div>
  );
}

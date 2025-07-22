// src/components/1_MainPage/BigNFTSlider/BigNFTSlider.jsx
'use client'
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { AiFillFire, AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { MdVerified, MdTimer } from "react-icons/md";
import { TbArrowBigLeftLines, TbArrowBigRightLine } from "react-icons/tb";

//INTERNAL IMPORT
import Style from "./BigNFTSilder.module.css";

export default function BigNFTSilder({ listings }) {
  const [idx, setIdx] = useState(0);

 // include both ETH and USD in each slide
 const sliderData = listings.map(item => ({
   title:    item.nft.title,
   id:       item.id,
   name:     item.seller.name,
   Category: item.nft.category,
   priceEth: item.price,
   priceUsd: item.usdPrice,
   image:    item.seller.avatarUrl,
   nftImage: item.nft.imageUrl,
 }));

  const inc = useCallback(() => {
    if (idx + 1 < sliderData.length) setIdx(idx + 1);
  }, [idx, sliderData.length]);

  const dec = useCallback(() => {
    if (idx > 0) setIdx(idx - 1);
  }, [idx]);

  if (sliderData.length === 0) {
    return <p>No listings found.</p>;
  }

  const current = sliderData[idx];

  return (
    <div className={Style.bigNFTSlider}>
      <div className={Style.bigNFTSlider_left}>
        <h2>{current.title}</h2>

        <div className={Style.bigNFTSlider_left_creator}>
          <div className={Style.bigNFTSlider_left_creator_profile}>
            <Image
              className={Style.bigNFTSlider_left_creator_profile_img}
              src={current.image}
              alt="creator avatar"
              width={50}
              height={50}
            />
            <div className={Style.bigNFTSlider_left_creator_profile_info}>
              <p>Creator</p>
              <h4>
                {current.name}{" "}
                <span>
                  <MdVerified />
                </span>
              </h4>
            </div>
          </div>
          <div className={Style.bigNFTSlider_left_creator_Category}>
            <AiFillFire
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

          {/* <p className={Style.bigNFTSlider_left_bidding_box_auction}>
            <MdTimer className={Style.bigNFTSlider_left_bidding_box_icon} />
            <span>Auction ending in</span>
          </p>

          <div className={Style.bigNFTSlider_left_bidding_box_timer}>
            <div className={Style.bigNFTSlider_left_bidding_box_timer_item}>
              <p>{sliderData[idNumber].time.days}</p>
              <span>Days</span>
            </div>

            <div className={Style.bigNFTSlider_left_bidding_box_timer_item}>
              <p>{sliderData[idNumber].time.hours}</p>
              <span>Hours</span>
            </div>

            <div className={Style.bigNFTSlider_left_bidding_box_timer_item}>
              <p>{sliderData[idNumber].time.minutes}</p>
              <span>mins</span>
            </div>

            <div className={Style.bigNFTSlider_left_bidding_box_timer_item}>
              <p>{sliderData[idNumber].time.seconds}</p>
              <span>secs</span>
            </div>
          </div> */}

          <div className={Style.bigNFTSlider_left_buttons}>
            <button className={Style.bigNFTSlider_left_buttons_button} onClick={() => {}}> Buy </button>
            <button className={Style.bigNFTSlider_left_buttons_button} onClick={() => {}}> View </button>
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
            src={current.nftImage}
            alt={current.title}
            width={400}
            height={400}
            className={Style.bigNFTSlider_right_box_img}
          />

          {/* <div className={Style.bigNFTSlider_right_box_like}>
            <AiFillHeart />
            <span>{sliderData[idNumber].like}</span>
          </div> */}
        </div>
      </div>
    </div>
  );
};
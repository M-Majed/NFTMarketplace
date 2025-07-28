// src/app/marketplace/NFTCard/NFTCard.jsx
"use client";
import React from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsImages } from "react-icons/bs";
import Image from "next/image";
import Filter from "./Filter/Filter";
//INTERNAL IMPORT
import Style from "./NFTCard.module.css";
import Title from "../../../components/_Shared/Title/Title";
import Link from "next/link";

export default function NFTCard({ items }) {
  // const [like, setLike] = useState(true);

  // const likeNft = () => {
  //   setLike(!like);
  // };

  return (
    <div className={Style.NFTCard}>
      <Title
        heading="Discover NFTs"
        paragraph="Explore the latest and greatest NFTs"
      />
      {/* tell Filter what’s selected and how to toggle */}
      <Filter />

      {items.map((listing) => (
        <div className={Style.NFTCard_box} key={listing.tokenId}>
          <Link href={`/nftdetails/${listing.tokenId}`}>
            <div className={Style.NFTCard_box_img}>
              <Image
                src={listing.image}
                alt={listing.name}
                width={600}
                height={600}
                className={Style.NFTCard_box_img_img}
              />
              <div className={Style.NFTCard_box_overlay}>
                <div className={Style.NFTCard_box_overlay_update}>
                  {/* <div className={Style.NFTCard_box_overlay_update_left}>
                    <div className={Style.NFTCard_box_overlay_update_left_like} onClick={() => likeNft()}>
                      {like ? (<AiOutlineHeart />) : (<AiFillHeart className={Style.NFTCard_box_overlay_update_left_like_icon}/>)}
                      {""} 22
                    </div>
                  </div> */}

                  {/* <div className={Style.NFTCard_box_overlay_update_right}>
                    <p>Remaining time</p>
                    <p>3h : 15m : 20s</p>
                  </div> */}
                </div>

                <div className={Style.NFTCard_box_overlay_update_details}>
                  <div
                    className={Style.NFTCard_box_overlay_update_details_price}>
                    <div
                      className={
                        Style.NFTCard_box_overlay_update_details_price_box
                      }>
                      <h4>{listing.name}</h4>
                      <div
                        className={
                          Style.NFTCard_box_overlay_update_details_price_box_box
                        }>
                        <div
                          className={
                            Style.NFTCard_box_overlay_update_details_price_box_bid
                          }>
                          <small>Price</small>
                          <p>Price: {listing.price} ETH</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      Style.NFTCard_box_overlay_update_details_category
                    }>
                    <BsImages />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

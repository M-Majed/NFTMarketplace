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

export default function NFTCard({ items = [] }) {


  return (
    <div className={Style.NFTCard}>
      <Title
        heading="Discover NFTs"
        paragraph="Explore the latest and greatest NFTs"
      />
      <Filter />

      {items.map((listing) => (
        <div className={Style.NFTCard_box} key={listing.id}>
          <Link href={`/nftdetails/${listing.nft.tokenId}`}>
            <div className={Style.NFTCard_box_img}>
              <Image
                src={listing.nft.imageUrl}
                alt={listing.nft.name}
                width={600}
                height={600}
                className={Style.NFTCard_box_img_img}
              />
              <div className={Style.NFTCard_box_overlay}>
                <div className={Style.NFTCard_box_overlay_update}>
                </div>

                <div className={Style.NFTCard_box_overlay_update_details}>
                  <div
                    className={Style.NFTCard_box_overlay_update_details_price}>
                    <div
                      className={
                        Style.NFTCard_box_overlay_update_details_price_box
                      }>
                      <h4>{listing.nft.name}</h4>
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

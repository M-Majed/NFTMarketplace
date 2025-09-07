// src/app/marketplace/NFTCard/NFTCard.jsx
"use client";
import React from "react";
import { BsImages } from "react-icons/bs";
import Image from "next/image";
import Filter from "./Filter/Filter";
import style from "./NFTCard.module.css";
import Title from "../../../components/_Shared/Title/Title";
import Link from "next/link";

export default function NFTCard({ items = [] }) {
  return (
    <div className={style.NFTCard}>
      {/* Header section (NOT in the grid) */}
      <div className={style.NFTHeader}>
        <Title
          heading="Discover NFTs"
          paragraph="Explore the latest and greatest NFTs"
        />
        <Filter />
      </div>

      {/* Cards grid */}
      <div className={style.NFTGrid}>
        {items.map((listing) => (
          <div className={style.NFTCard_box} key={listing.id}>
            <Link href={`/nftdetails/${listing.nft.tokenId}`}>
              <div className={style.NFTCard_box_img}>
                <Image
                  src={listing.nft.imageUrl}
                  alt={listing.nft.name}
                  width={600}
                  height={600}
                  sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className={style.NFTCard_box_img_img}
                  priority={false}
                />
                <div className={style.NFTCard_box_overlay}>
                  <div className={style.NFTCard_box_overlay_update} />
                  <div className={style.NFTCard_box_overlay_update_details}>
                    <div
                      className={
                        style.NFTCard_box_overlay_update_details_price
                      }>
                      <div
                        className={
                          style.NFTCard_box_overlay_update_details_price_box
                        }>
                        <h4>{listing.nft.name}</h4>
                        <div
                          className={
                            style.NFTCard_box_overlay_update_details_price_box_box
                          }>
                          <div
                            className={
                              style.NFTCard_box_overlay_update_details_price_box_bid
                            }>
                            <small>Price</small>
                            <p>Price: {listing.price} ETH</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={
                        style.NFTCard_box_overlay_update_details_category
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
    </div>
  );
}

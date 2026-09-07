"use client";
import React from "react";
import Image from "next/image";
import Filter from "./Filter/Filter";
import Style from "./NFTCard.module.css";
import Link from "next/link";
import { categories } from "@/app/constants";

export default function NFTCard({ items = [] }) {
  // Get the icon based on category
  const getCategoryIcon = (category) => {
    const categoryObj = categories.find((cat) => cat.category === category);
    console.log('Category Object:', categoryObj);
    return categoryObj.icon;
  };
  return (
    <div className={Style.NFTCard}>
      <div className={Style.NFTHeader}>
          <h2>Discover NFTs</h2>

        <Filter />
      </div>

      <div className={Style.NFTGrid}>
        {items.map((item) => {
          const Icon = getCategoryIcon(item.category); // Dynamically get the icon
          return (
            <div className={Style.NFTCard_box} key={item.id}>
              <Link
                href={`/nftdetails/${item.nft.tokenId}`}
                className={Style.NFTCard_box_img}
              >
                <Image
                  src={item.nft.imageUrl}
                  alt={item.nft.name}
                  width={600}
                  height={600}
                  className={Style.NFTCard_box_img_img}
                  priority={false}
                />
                <div className={Style.NFTCard_box_overlay}>
                  <div className={Style.NFTCard_box_overlay_update_details}>
                    <div className={Style.NFTCard_box_overlay_update_details_price}>
                      <div className={Style.NFTCard_box_overlay_update_details_price_box}>
                        <h4>{item.nft.name}</h4>
                        <div className={Style.NFTCard_box_overlay_update_details_price_box_bid}>
                          <small>Price</small>
                          <p>Price: {item.price} ETH</p>
                        </div>
                      </div>
                    </div>
                    <div className={Style.NFTCard_box_overlay_update_details_category}>
                      <Icon />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
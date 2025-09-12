'use client'
import React from "react";
import Image from "next/image";
import Style from "./NFTDetailsImg.module.css";
import { NFTMarketplaceAddress } from "@/context/constants";

export default function NFTDetailsImg( {listing} ) {
  return (
    <div className={Style.NFTDetailsImg}>
      <Image
        src={listing.nft.imageUrl}
        alt={listing.nft.name}
        width={listing.nft.width}
        height={listing.nft.height}
        sizes="(max-width: 1024px) 100vw, 60vw"
        className={Style.NFTDetailsImg_NFT_img}
        style={{ objectFit: "cover" }}
        priority
      />
      <div className={Style.NFTDetailsImg_description}>
        <p>{listing.nft.description ? listing.nft.description : "No description available."}</p>
        <small>category: {listing.category}</small><br />
        <small>{listing.nft.width} x {listing.nft.height} px</small>
        <p>
          <small>Contract Address</small><br />
          {NFTMarketplaceAddress}
        </p>
        <p>
          <small>Token ID</small><br />
          {listing.nft.tokenId}
        </p>
      </div>
    </div>
  );
};

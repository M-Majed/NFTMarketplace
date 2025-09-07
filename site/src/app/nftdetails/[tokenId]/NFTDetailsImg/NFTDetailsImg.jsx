// src/app/nftdetails/[nftId]/NFTDetailsImg/NFTDetailsImg.jsx
"use client";

import React from "react";
import Image from "next/image";
import Style from "./NFTDetailsImg.module.css";
import { NFTMarketplaceAddress } from "@/context/constants";

export default function NFTDetailsImg({ nft, listing }) {
  return (
    <div className={Style.NFTDetailsImg}>
      <Image
        src={nft.imageUrl}
        alt={nft.name}
        width={nft.width}
        height={nft.height}
        sizes="(max-width: 1024px) 100vw, 60vw"
        className={Style.NFTDetailsImg_NFT_img}
        style={{ objectFit: "cover" }}
        priority
      />
      <div className={Style.NFTDetailsImg_description}>
        <p>{nft.description ? nft.description : "No description available."}</p>
        <small>{nft.width} x {nft.height} px</small>
        <p>
          <small>Contract Address</small><br />
          {NFTMarketplaceAddress}
        </p>
        <p>
          <small>Token ID</small><br />
          {nft.tokenId}
        </p>
      </div>
    </div>
  );
}

'use client'

import React, { useState, useEffect } from "react";
import Image from "next/image";

//INTERNAL IMPORT
import Style from "./NFTDetailsImg.module.css";
import img from "../../../../../public/img";

export default function NFTDetailsImg({ nft }) {
  return (
    <div className={Style.NFTDetailsImg}>
        <Image
          src={nft.imageUrl}
          alt={nft.title}
          width={nft.width}
          height={nft.height}
          objectFit="cover"
          className={Style.NFTDetailsImg_NFT_img}
        />
      <div className={Style.NFTDetailsImg_description}>
        <p>
          {nft.description ? nft.description : "No description available."}
        </p>
        <small>{nft.width} x {nft.height} px</small>
        <p>
          <small>Contract Address</small>
          <br />
          {nft.contractAddress}
        </p>
        <p>
          <small>Token ID</small>
          <br />
          {nft.tokenId}
        </p>
      </div>
    </div>
  );
};


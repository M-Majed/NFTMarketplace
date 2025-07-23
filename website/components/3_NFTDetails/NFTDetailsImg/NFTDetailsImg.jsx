import React, { useState, useEffect } from "react";
import Image from "next/image";

//INTERNAL IMPORT
import Style from "./NFTDetailsImg.module.css";
import images from "../../../img";

const NFTDetailsImg = () => {
  return (
    <div className={Style.NFTDetailsImg}>
      <div className={Style.NFTDetailsImg_NFT}>
        <Image
          src={images.nft_image_1}
          className={Style.NFTDetailsImg_NFT_img}
          alt="NFT image"
          objectFit="cover"
        />
      </div>
      <div className={Style.NFTDetailsImg_description}>
        <p>
          Tattooed Kitty Gang (“TKG”) is a collection of 666 badass kitty
          gangsters, with symbol of tattoos, living in the Proud Kitty Gang
          (“PKG”) metaverse. Each TKG is an 1/1 ID as gangster member & all the
          joint rights.
        </p>
        <small>2000 x 2000 px.IMAGE(685KB)</small>
        <p>
          <small>Contract Address</small>
          <br />
          0x50f5474724e0ee42d9a4e711ccfb275809fd6d4a
        </p>
        <p>
          <small>Token ID</small>
          <br />
          100300372864
        </p>
      </div>
    </div>
  );
};

export default NFTDetailsImg;

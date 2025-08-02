// src/app/nftdetails/[nftId]/NFTDescription/NFTDescription.jsx
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  MdVerified,
  MdCloudUpload,
  MdReportProblem,
  MdOutlineDeleteSweep,
} from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import {
  TiSocialFacebook,
  TiSocialLinkedin,
  TiSocialTwitter,
  TiSocialYoutube,
  TiSocialInstagram,
} from "react-icons/ti";

//INTERNAL IMPORT
import Style from "./NFTDescription.module.css";
import img from "@/lib/img";

import { useContext } from "react";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function NFTDescription({ nft, seller, price, usdPrice  }) {
  const [social, setSocial] = useState(false);
  const [NFTMenu, setNFTMenu] = useState(false);

  const { buyNFT } = useContext(NFTMarketplaceContext);
  const { address, isConnected } = useAccount();
  const router = useRouter();

  const openSocial = () => {
    setSocial(!social);
    setNFTMenu(false);
  };

  const openNFTMenu = () => {
    setNFTMenu(!NFTMenu);
    setSocial(false);
  };

  const handleBuy = async () => {
    if (!isConnected) return alert("Connect your wallet first");

    try {
      const txHash = await buyNFT({ tokenId: nft.tokenId, price });
      if (!txHash) throw new Error("Transaction failed");

      const res = await fetch("/api/buy-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: nft.tokenId,
          buyerAddress: address,
          price,
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

  return (
    <div className={Style.NFTDescription}>
      <div className={Style.NFTDescription_share}>
        <div className={Style.NFTDescription_share_box}>
          <MdCloudUpload
            className={Style.NFTDescription_share_box_icon}
            onClick={() => openSocial()}
          />
          {social && (
            <div className={Style.NFTDescription_share_box_social}>
              <a href="#">
                <TiSocialFacebook /> Facebook
              </a>
              <a href="#">
                <TiSocialInstagram /> Instragram
              </a>
              <a href="#">
                <TiSocialLinkedin /> LinkedIn
              </a>
              <a href="#">
                <TiSocialTwitter /> Twitter
              </a>
              <a href="#">
                <TiSocialYoutube /> YouTube
              </a>
            </div>
          )}

          <BsThreeDots
            className={Style.NFTDescription_share_box_icon}
            onClick={() => openNFTMenu()}
          />

          {NFTMenu && (
            <div className={Style.NFTDescription_share_box_social}>
              <a href="#">
                <MdReportProblem /> Report
              </a>
              <a href="#">
                <MdOutlineDeleteSweep /> Add to WishList
              </a>
            </div>
          )}
        </div>
      </div>
      {/* //Part TWO */}
      <div className={Style.NFTDescription_profile}>
        <h1>{nft.name}</h1>
        <div className={Style.NFTDescription_profile_box}>
          <div className={Style.NFTDescription_profile_box_info}>
            <small>Creator</small> <br />
            <span>
              {seller.walletAddress} <MdVerified />
            </span>
          </div>
        </div>

        <div className={Style.NFTDescription_profile_biding}>
          <div className={Style.NFTDescription_profile_biding_box_price}>
            <small>Price</small>
            <p>
              {price} ETH &nbsp;<span>(${usdPrice})</span>
            </p>
          </div>

          <div className={Style.NFTDescription_profile_biding_box_buttons}>
            <button
              onClick={handleBuy}
              className={
                Style.NFTDescription_profile_biding_box_buttons_button
              }>
              {" "}
              Buy Now{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

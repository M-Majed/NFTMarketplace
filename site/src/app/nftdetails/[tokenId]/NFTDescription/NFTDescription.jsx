// src/app/nftdetails/[nftId]/NFTDescription/NFTDescription.jsx
"use client";

import React, { useState, useContext, useRef, useEffect } from "react";
import Image from "next/image";
import {
  MdVerified,
  MdCloudUpload,
  MdReportProblem,
  MdOutlineAddToPhotos,
} from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import {
  TiSocialFacebook,
  TiSocialLinkedin,
  TiSocialTwitter,
  TiSocialYoutube,
  TiSocialInstagram,
} from "react-icons/ti";

import Style from "./NFTDescription.module.css";
import img from "@/lib/img";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";

export default function NFTDescription({ nft, seller, price, usdPrice, listingId }) {
  const [social, setSocial] = useState(false);
  const [NFTMenu, setNFTMenu] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const { buyNFT } = useContext(NFTMarketplaceContext);
  const { address, isConnected } = useAccount();
  const router = useRouter();

  // Check wishlist status when wallet or listing changes
  useEffect(() => {
    const run = async () => {
      if (!isConnected || !listingId || !address) return;
      setIsChecking(true);
      try {
        const res = await fetch(
          `/api/wishlist?listingId=${encodeURIComponent(listingId)}&walletAddress=${encodeURIComponent(address)}`,
          { cache: "no-store" }
        );
        const data = await res.json();
        if (res.ok) setInWishlist(!!data.inWishlist);
      } catch {
        // ignore
      } finally {
        setIsChecking(false);
      }
    };
    run();
  }, [isConnected, listingId, address]);

  // --- tiny hover-gap protection ---
  const timers = useRef({ social: null, menu: null });
  const OPEN_DELAY = 0;     // open immediately
  const CLOSE_DELAY = 300;  // close a beat later

  const clearTimer = (key) => {
    if (timers.current[key]) {
      clearTimeout(timers.current[key]);
      timers.current[key] = null;
    }
  };

  const openSocial = () => {
    clearTimer("social");
    clearTimer("menu");
    setNFTMenu(false);
    timers.current.social = setTimeout(() => setSocial(true), OPEN_DELAY);
  };
  const closeSocial = () => {
    clearTimer("social");
    timers.current.social = setTimeout(() => setSocial(false), CLOSE_DELAY);
  };

  const openMenu = () => {
    clearTimer("menu");
    clearTimer("social");
    setSocial(false);
    timers.current.menu = setTimeout(() => setNFTMenu(true), OPEN_DELAY);
  };
  const closeMenu = () => {
    clearTimer("menu");
    timers.current.menu = setTimeout(() => setNFTMenu(false), CLOSE_DELAY);
  };
  // --- end hover-gap protection ---

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

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    if (!isConnected) return alert("Connect your wallet first");
    if (!listingId) return alert("Listing is missing");
    setIsAdding(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, walletAddress: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add to wishlist");
      setInWishlist(true);
    } catch (err) {
      alert("Add to wishlist failed: " + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFromWishlist = async (e) => {
    e.preventDefault();
    if (!isConnected) return alert("Connect your wallet first");
    if (!listingId) return alert("Listing is missing");
    setIsAdding(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, walletAddress: address }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove");
      setInWishlist(false);
    } catch (err) {
      alert("Remove from wishlist failed: " + err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistClick = (e) => {
    if (inWishlist) return handleRemoveFromWishlist(e);
    return handleAddToWishlist(e);
  };

  return (
    <div className={Style.NFTDescription}>
      <div className={Style.NFTDescription_share}>
        <div className={Style.NFTDescription_share_box}>
          {/* SOCIAL (hover to open) */}
          <div onMouseEnter={openSocial} onMouseLeave={closeSocial}>
            <MdCloudUpload className={Style.NFTDescription_share_box_icon} />
            {social && (
              <div
                className={Style.NFTDescription_share_box_social}
                onMouseEnter={openSocial}
                onMouseLeave={closeSocial}
              >
                <a href="#"><TiSocialFacebook /> Facebook</a>
                <a href="#"><TiSocialInstagram /> Instagram</a>
                <a href="#"><TiSocialLinkedin /> LinkedIn</a>
                <a href="#"><TiSocialTwitter /> Twitter</a>
                <a href="#"><TiSocialYoutube /> YouTube</a>
              </div>
            )}
          </div>

          {/* NFT MENU (hover to open) */}
          <div onMouseEnter={openMenu} onMouseLeave={closeMenu}>
            <BsThreeDots className={Style.NFTDescription_share_box_icon} />
            {NFTMenu && (
              <div
                className={Style.NFTDescription_share_box_social}
                onMouseEnter={openMenu}
                onMouseLeave={closeMenu}
              >
                <a href="#"><MdReportProblem /> Report</a>
                <a href="#" onClick={handleWishlistClick}>
                  <MdOutlineAddToPhotos />{" "}
                  {isAdding ? (inWishlist ? "Removing..." : "Adding...") : (inWishlist ? "Remove from WishList" : "Add to WishList")}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Part TWO */}
      <div className={Style.NFTDescription_profile}>
        <h1>{nft.name}</h1>
        <div className={Style.NFTDescription_profile_box}>
          <div className={Style.NFTDescription_profile_box_info}>
            <small>Creator</small> <br />
            <span>{seller.walletAddress} <MdVerified /></span>
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
              className={Style.NFTDescription_profile_biding_box_buttons_button}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

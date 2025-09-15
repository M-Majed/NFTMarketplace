"use client";
import React, { useState, useContext, useRef, useEffect } from "react";
import {
  MdCloudUpload,
  MdReportProblem,
  MdOutlineAddToPhotos,
} from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import {
  TiSocialFacebook,
  TiSocialTwitter,
  TiSocialInstagram,
} from "react-icons/ti";
import Style from "./NFTDescription.module.css";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { FaTelegramPlane } from "react-icons/fa";

export default function NFTDescription({
  nft,
  seller,
  price,
  usdPrice,
  listingId,
}) {
  const [social, setSocial] = useState(false); //* social menu
  const [NFTMenu, setNFTMenu] = useState(false); //* three dot menu
  const [isAdding, setIsAdding] = useState(false); //* wishlist action state
  const [inWishlist, setInWishlist] = useState(false); //* is in wishlist

  const { buyNFT } = useContext(NFTMarketplaceContext);
  const { address, isConnected } = useAccount();
  const router = useRouter();

  //$ hover gap protection for social and menu
  const timers = useRef({ social: null, menu: null });
  const OPEN_DELAY = 0; // open immediately
  const CLOSE_DELAY = 300; // close a beat later

  //$ Check if owner is viewing
  const isOwnerViewing =
    !!address && //* !!: convert to boolean
    !!seller?.walletAddress && //* ?: ensure not null
    address.toLowerCase() === seller.walletAddress.toLowerCase();

  //$ Check if in wishlist
  useEffect(() => {
    const run = async () => {
      if (!isConnected || !listingId) return;
      const res = await fetch(`/api/wishlist?listingId=${encodeURIComponent(listingId)}`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setInWishlist(!!data.inWishlist);
    };
    run();
  }, [isConnected, listingId, address]); //* run again if connection, listingId, or address changes

  //$ hover gap protection
  const clearTimer = (key) => {
    if (timers.current[key]) {
      clearTimeout(timers.current[key]);
      timers.current[key] = null;
    }
  };

  //$ Open/close handlers with delays for social menu
  const openSocial = () => {
    clearTimer("social"); //* clear any existing timer
    clearTimer("menu"); //* clear any existing timer
    setNFTMenu(false); //* close menu if open
    timers.current.social = setTimeout(() => setSocial(true), OPEN_DELAY); //* start open timer
  };
  const closeSocial = () => {
    clearTimer("social");
    timers.current.social = setTimeout(() => setSocial(false), CLOSE_DELAY); //* start close timer
  };

  //$ Open/close handlers with delays for NFT menu
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

  //$ Handle Buy
  const handleBuy = async () => {
    //* validation
    if (isOwnerViewing) {
      alert("You can’t buy your own NFT.");
      return;
    }
    if (!isConnected) return alert("Connect your wallet first");

    try {
      const txHash = await buyNFT({ tokenId: nft.tokenId, price }); //* call buyNFT from SC + db changes
      if (!txHash) throw new Error("Transaction failed");
      router.push("/");
    } catch (err) {
      alert("Buy failed: " + err.message);
    }
  };

  //$ Handle Wishlist click (add or remove)
  const handleWishlistClick = (e) => {
    if (inWishlist) return handleRemoveFromWishlist(e);
    return handleAddToWishlist(e);
  };

  //$ Handle Wishlist
  const handleAddToWishlist = async (e) => {
    e.preventDefault(); //* don't follow link -> no #
    if (!isConnected) return alert("Connect your wallet first");
    if (!listingId) return alert("Listing is missing");

    setIsAdding(true);
    try {
      const res = await fetch("/api/wishlist", {
        //* add to wishlist in DB
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
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

  //$ Handle Remove from Wishlist
  const handleRemoveFromWishlist = async (e) => {
    e.preventDefault();
    if (!isConnected) return alert("Connect your wallet first");
    if (!listingId) return alert("Listing is missing");

    setIsAdding(true);
    try {
      const res = await fetch("/api/wishlist", {
        //* remove from wishlist in DB
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
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
  //$ Get current page URL and share text
  function getPageUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }
  //$ Get share text (page title or fallback)
  function getShareText(fallback = "Check this out!") {
    if (typeof document !== "undefined" && document.title)
      return document.title;
    return fallback;
  }
  //$ Open URL in new tab
  const openBlank = (href) =>
    window.open(href, "_blank", "noopener,noreferrer");
  //$ Social share handlers
  const onShareFacebook = (e) => {
    e.preventDefault();
    const u = encodeURIComponent(getPageUrl());
    openBlank(`https://www.facebook.com/sharer/sharer.php?u=${u}`);
  };
  const onShareTelegram = (e) => {
    e.preventDefault();
    const u = encodeURIComponent(getPageUrl());
    const t = encodeURIComponent(getShareText());
    openBlank(`https://t.me/share/url?url=${u}&text=${t}`);
  };
  const onShareTwitter = (e) => {
    e.preventDefault();
    const u = encodeURIComponent(getPageUrl());
    const t = encodeURIComponent(getShareText());
    // works for X/Twitter
    openBlank(`https://twitter.com/intent/tweet?url=${u}&text=${t}`);
  };
  const onShareInstagram = async (e) => {
    e.preventDefault();
    const url = getPageUrl();
    const text = getShareText();
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        alert("Link copied! Open Instagram and paste it into a post or DM.");
      }
    } catch {
      alert("Share failed. Please try again.");
    }
  };

  //$ Handle Report
  const handleReport = async (e) => {
    e.preventDefault(); //* don't follow link -> no #
    if (!isConnected) return alert("Connect your wallet first");
    if (!listingId) return alert("Listing is missing");

    try {
      //* check if already reported
      const checkRes = await fetch(
        `/api/report?listingId=${encodeURIComponent(listingId)}`
      );
      const checkData = await checkRes.json();
      //* handle errors and status
      if (!checkRes.ok) {
        throw new Error(checkData?.error || "Couldn't verify report status");
      }
      if (checkData?.reported) {
        alert("You already reported this listing.");
        return;
      }

      //* get reason (optional)
      const reason =
        typeof window !== "undefined"
          ? window.prompt("Why are you reporting this listing? (optional)")
          : "";

      //*submit the report
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          reason: (reason || "").slice(0, 500),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Failed to submit report");
      }
      alert("Thanks — your report was submitted.");
    } catch (err) {
      alert("Report failed: " + err.message);
    }
  };

  return (
    <div className={Style.NFTDescription}>
      <div
        className={`${Style.NFTDescription_share} ${Style.NFTDescription_share_box}`}>
        <div onMouseEnter={openSocial} onMouseLeave={closeSocial}>
          <MdCloudUpload className={Style.NFTDescription_share_box_icon} />
          {social && (
            <div
              className={Style.NFTDescription_share_box_social}
              onMouseEnter={openSocial}
              onMouseLeave={closeSocial}>
              <a href="#" onClick={onShareFacebook}>
                <TiSocialFacebook /> Facebook
              </a>

              <a href="#" onClick={onShareInstagram}>
                <TiSocialInstagram /> Instagram
              </a>

              <a href="#" onClick={onShareTelegram}>
                <FaTelegramPlane /> Telegram
              </a>

              <a href="#" onClick={onShareTwitter}>
                <TiSocialTwitter /> Twitter
              </a>
            </div>
          )}
        </div>

        <div onMouseEnter={openMenu} onMouseLeave={closeMenu}>
          <BsThreeDots className={Style.NFTDescription_share_box_icon} />
          {NFTMenu && (
            <div
              className={Style.NFTDescription_share_box_social}
              onMouseEnter={openMenu}
              onMouseLeave={closeMenu}>
              <a href="#" onClick={handleReport}>
                <MdReportProblem /> Report
              </a>
              <a href="#" onClick={handleWishlistClick}>
                <MdOutlineAddToPhotos />{" "}
                {isAdding
                  ? inWishlist
                    ? "Removing..."
                    : "Adding..."
                  : inWishlist
                  ? "Remove from WishList"
                  : "Add to WishList"}
              </a>
            </div>
          )}
        </div>
      </div>

      <div className={Style.NFTDescription_profile}>
        <h1>{nft.name}</h1>
        <div className={Style.NFTDescription_profile_box_info}>
          <small>Creator</small> <br />
          <span>{seller.walletAddress}</span>
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
              disabled={isOwnerViewing}
              className={
                Style.NFTDescription_profile_biding_box_buttons_button
              }>
              {isOwnerViewing ? "You can’t buy your own NFT" : "Buy NFT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

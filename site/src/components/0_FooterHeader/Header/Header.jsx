"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdNotifications } from "react-icons/md";
import { BsSearch } from "react-icons/bs";
import style from "./Header.module.css";
import img from "../../../../public/img";
import Discover from "./Discover/Discover";
import HelpCenter from "./HelpCenter/HelpCenter";
import Notification from "./Notification/Notification";
import Profile from "./Profile/Profile";
import { useRouter } from "next/navigation";

const Header = () => {
  const [discover, setDiscover] = useState(false);
  const [help, setHelp] = useState(false);
  const [notification, setNotification] = useState(false);
  const [profile, setProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  const router = useRouter();
  const discoverRef = useRef();
  const helpRef = useRef();
  const notificationRef = useRef();
  const profileRef = useRef();

  // on mount, restore from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const addr = localStorage.getItem("walletAddress");
      if (addr) setWalletAddress(addr);
    }
  }, []);

  const openNotification = () => {
    setNotification(!notification);
    setDiscover(false);
    setHelp(false);
    setProfile(false);
  };

  const openProfile = () => {
    setProfile(!profile);
    setDiscover(false);
    setHelp(false);
    setNotification(false);
  };

  const handleSearch = () => {
    const term = searchTerm.trim();
    if (term) {
      // only add the query when non-empty
      router.push(`/marketplace?search=${encodeURIComponent(term)}`);
    } else {
      // blank search → show all listings
      router.push("/marketplace");
    }
  };

  // sign-in with Ethereum: always prompt the user
  const handleWalletLogin = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask");
      return;
    }

    try {
      // 1) ensure the site is connected and get the account
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // 2) build a one-time challenge
      const nonce = Math.random().toString(36).slice(2);
      const msg   = `NFT Marketplace login\n\n` +
                    `Address: ${account}\n` +
                    `Nonce:   ${nonce}`;

      // 3) ask for a signature — this WILL pop MetaMask every time
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [msg, account],
      });

      // 4) you _could_ verify the signature server-side,
      //    but for now we just store the address locally
      setWalletAddress(account);
      localStorage.setItem("walletAddress", account);
      localStorage.setItem("loginNonce", nonce);
      localStorage.setItem("loginSig", signature);
      // ─── Upsert the user in our database ──────────────────────────────
      try {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: account }),
        });
      } catch (e) {
        console.error("Failed to upsert user:", e);
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  // simple logout: clear local state & storage
  const handleWalletLogout = () => {
    setWalletAddress(null);
    localStorage.removeItem("walletAddress");
    router.replace("/");   // ← navigate home immediately
  };

  return (
    <div className={style.header}>
      <div className={style.header_container_left}>
        <Link href="/">
          <div className={style.header_container_left_logo}>
            <Image
              className={style.logo}
              src={img.logo}
              alt="NFT MARKETPLACE"
            />
          </div>
        </Link>
        <div className={style.header_container_left_box_input}>
          <input
            type="text"
            placeholder="Search NFT"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className={style.header_container_left_searchbtn}
            onClick={handleSearch}>
            <BsSearch />
          </button>
        </div>
      </div>

      <div className={style.header_container_right}>
        <Link href={`/createnft`}>
          <button className={style.header_container_right_createNFT}>
            {" "}
            Create NFT{" "}
          </button>
        </Link>
        <div
          ref={discoverRef}
          className={style.header_container_right_discover}
          onMouseEnter={() => setDiscover(true)}
          onMouseLeave={() => setDiscover(false)}>
          <p>Discover</p>
          {discover && (
            <div className={style.header_container_right_discover_box}>
              <Discover />
            </div>
          )}
        </div>

        <div
          ref={helpRef}
          className={style.header_container_right_help}
          onMouseEnter={() => setHelp(true)}
          onMouseLeave={() => setHelp(false)}>
          <p>Help Center</p>
          {help && (
            <div className={style.header_container_right_help_box}>
              <HelpCenter />
            </div>
          )}
        </div>

        <div
          ref={notificationRef}
          className={style.header_container_right_notification}
          onClick={openNotification}>
          <MdNotifications
            className={style.header_container_right_notification_icon}
          />
          {notification && (
            <div className={style.header_container_right_notification_box}>
              <Notification />
            </div>
          )}
        </div>

        {walletAddress ? (
          <div
            ref={profileRef}
            className={style.header_container_right_profile}>
            <Image
              src={img.user1}
              className={style.header_container_right_profileImg}
              alt="Profile"
              onClick={openProfile}
            />
            {profile && (
              <div className={style.header_container_right_profile_box}>
                <Profile
                address={walletAddress}
                onLogout={handleWalletLogout} />
              </div>
            )}
          </div>
        ) : (
          <button
            className={style.header_container_right_createNFT}
            onClick={handleWalletLogin}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;

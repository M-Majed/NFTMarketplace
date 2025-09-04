// src/components/0_FooterHeader/Header/Header.jsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { PiListHeartBold } from "react-icons/pi";import { BsSearch } from "react-icons/bs";
import style from "./Header.module.css";
import img from "@/lib/img";
import Discover from "./Discover/Discover";
import HelpCenter from "./HelpCenter/HelpCenter";
import Notification from "./Notification --not-needed/Notification";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const Header = () => {
  const { address, isConnected } = useAccount();
  const [discover, setDiscover] = useState(false);
  const [help, setHelp] = useState(false);
  const [notification, setNotification] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();
  const discoverRef = useRef();
  const helpRef = useRef();
  const notificationRef = useRef();

  const openNotification = () => {
    setNotification(!notification);
    setDiscover(false);
    setHelp(false);
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

  // when a wallet connects, ensure the user exists in our DB
  useEffect(() => {
    if (!isConnected || !address) return;
    fetch("/api/add-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address }),
    }).catch(console.error);
  }, [isConnected, address]);

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
          className={style.header_container_right_notification}
          onClick={() => router.push("/marketplace?wishlist=1")}
          style={{ cursor: "pointer" }}
          >
          <PiListHeartBold
            className={style.header_container_right_notification_icon}
          />
        </div>

        <ConnectButton.Custom>
          {({
            account,
            chain,
            openChainModal,
            openConnectModal,
            openAccountModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== "loading";
            const connected =
              ready &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === "authenticated");
            return (() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className={style.header_container_right_createNFT}>
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button">
                    Wrong network
                  </button>
                );
              }
              return (
                <button
                  onClick={openAccountModal}
                  type="button"
                  className={style.header_container_right_createNFT}>
                  {account.displayName}
                </button>
              );
            })();
          }}
        </ConnectButton.Custom>
        {isConnected && (
          <Link href={`/profile`}>
            <button className={style.header_container_right_createNFT}>
              {" "}
              Profile{" "}
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Header;

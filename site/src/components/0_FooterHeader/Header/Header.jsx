// src/components/0_FooterHeader/Header/Header.jsx
"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { PiListHeartBold } from "react-icons/pi";
import { BsSearch } from "react-icons/bs";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";

import style from "./Header.module.css";
import img from "@/lib/img";
import Discover from "./Discover/Discover";
import HelpCenter from "./HelpCenter/HelpCenter";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

const Header = () => {
  const { address, isConnected } = useAccount();
  const [discover, setDiscover] = useState(false);
  const [help, setHelp] = useState(false);
  const [notification, setNotification] = useState(false); // kept for parity
  const [searchTerm, setSearchTerm] = useState("");

  // mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false);
  const [mobileHelpOpen, setMobileHelpOpen] = useState(false);

  const router = useRouter();

  const openNotification = () => {
    setNotification(!notification);
    setDiscover(false);
    setHelp(false);
  };

  const handleSearch = () => {
    const term = searchTerm.trim();
    setMobileOpen(false); // close drawer on search (mobile)
    if (term) {
      router.push(`/marketplace?search=${encodeURIComponent(term)}`);
    } else {
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

  // lock body scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  return (
    <>
      <div className={style.header}>
        <div className={style.header_container_left}>
          <Link href="/">
            <Image
              className={style.header_container_left_logo}
              src={img.logo}
              alt="NFT MARKETPLACE"
            />
          </Link>

          {/* Desktop search */}
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
              onClick={handleSearch}
              aria-label="Search">
              <BsSearch />
            </button>
          </div>
        </div>

        {/* Desktop right side */}
        <div className={style.header_container_right}>
          <Link href={`/createnft`}>
            <button className={style.header_container_right_createNFT}>
              Create NFT
            </button>
          </Link>

          <div
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
            style={{ cursor: "pointer" }}>
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
                Profile
              </button>
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={style.mobile_toggle}
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu">
          <RxHamburgerMenu />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`${style.sidebar_overlay} ${
          mobileOpen ? style.sidebar_overlay_open : ""
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile sidebar */}
      <aside
        className={`${style.sidebar} ${mobileOpen ? style.sidebar_open : ""}`}
        aria-hidden={!mobileOpen}>
        <div className={style.sidebar_header}>
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Image
              src={img.logo}
              alt="NFT MARKETPLACE"
              width={40}
              height={40}
            />
          </Link>
          <button
            className={style.sidebar_close}
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu">
            <IoClose />
          </button>
        </div>

        {/* Mobile search */}
        <div className={style.sidebar_search}>
          <input
            type="text"
            placeholder="Search NFT"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} aria-label="Search">
            <BsSearch />
          </button>
        </div>

        <div className={style.sidebar_group}>
          <Link href="/createnft" onClick={() => setMobileOpen(false)}>
            <button className={style.sidebar_primary_button}>Create NFT</button>
          </Link>
        </div>

        <div className={style.sidebar_group}>
          <div
            className={style.sidebar_link}
            onClick={() => setMobileDiscoverOpen((v) => !v)}>
            <span>Discover</span>
            <span>{mobileDiscoverOpen ? "–" : "+"}</span>
          </div>
          {mobileDiscoverOpen && (
            <div className={style.sidebar_panel}>
              <Discover />
            </div>
          )}
        </div>

        <div className={style.sidebar_group}>
          <div
            className={style.sidebar_link}
            onClick={() => setMobileHelpOpen((v) => !v)}>
            <span>Help Center</span>
            <span>{mobileHelpOpen ? "–" : "+"}</span>
          </div>
          {mobileHelpOpen && (
            <div className={style.sidebar_panel}>
              <HelpCenter />
            </div>
          )}
        </div>

        <div className={style.sidebar_group}>
          <button
            className={`${style.sidebar_primary_button} ${style.wishlist_button}`}
            onClick={() => {
              setMobileOpen(false);
              router.push("/marketplace?wishlist=1");
            }}>
            <PiListHeartBold /> Wishlist
          </button>
        </div>

        <div className={style.sidebar_footer}>
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
                      onClick={() => {
                        openConnectModal();
                      }}
                      type="button"
                      className={style.sidebar_primary_button}>
                      Connect Wallet
                    </button>
                  );
                }
                if (chain.unsupported) {
                  return (
                    <button
                      onClick={openChainModal}
                      type="button"
                      className={style.sidebar_primary_button}>
                      Wrong network
                    </button>
                  );
                }
                return (
                  <>
                    <button
                      onClick={openAccountModal}
                      type="button"
                      className={style.sidebar_primary_button}>
                      {account.displayName}
                    </button>
                    {isConnected && (
                      <Link
                        href="/profile"
                        onClick={() => setMobileOpen(false)}>
                        <button className={style.sidebar_primary_button}>
                          Profile
                        </button>
                      </Link>
                    )}
                  </>
                );
              })();
            }}
          </ConnectButton.Custom>
        </div>
      </aside>
    </>
  );
};

export default Header;

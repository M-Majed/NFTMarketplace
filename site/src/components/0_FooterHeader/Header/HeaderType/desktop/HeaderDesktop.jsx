"use client";
import Image from "next/image";
import Link from "next/link";
import { BsSearch } from "react-icons/bs";
import { PiListHeartBold } from "react-icons/pi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function HeaderDesktop({
  style,
  img,
  searchTerm,
  setSearchTerm,
  handleSearch,
  discover,
  setDiscover,
  help,
  setHelp,
  router,
  isConnected,
  Discover,
  HelpCenter,
}) {
  return (
    <div className={style.header}>

      <div className={style.header_container_left}>
        <Link href="/">
          <Image
            className={style.header_container_left_logo}
            src={img.logo}
            alt="NFT MARKETPLACE"
          />
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
        <Link href="/createnft">
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
          className={style.header_container_right_wishlist}
          onClick={() => router.push("/marketplace?wishlist=1")}
          style={{ cursor: "pointer" }}>
          <PiListHeartBold
            className={style.header_container_right_wishlist_icon}
          />
        </div>
        <ConnectButton.Custom>
          {({
            account, //* account info
            chain, //* currently connected chain
            openChainModal, //* open connect wallet modal
            openConnectModal, //* open network switch modal
            openAccountModal, //* open account modal(address, disconnect)
            authenticationStatus, //* 'loading' | 'authenticated' | 'unauthenticated'
            mounted, //* true only after the component runs on the browser
          }) => {
            const ready = mounted && authenticationStatus !== "loading";
            const connected =
              ready &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === "authenticated");

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
          }}
        </ConnectButton.Custom>

        {isConnected && (
          <Link href="/profile">
            <button className={style.header_container_right_createNFT}>
              Profile
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

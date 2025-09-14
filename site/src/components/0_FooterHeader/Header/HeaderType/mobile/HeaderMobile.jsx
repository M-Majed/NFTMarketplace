"use client";
import Image from "next/image";
import Link from "next/link";
import { BsSearch } from "react-icons/bs";
import { PiListHeartBold } from "react-icons/pi";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function HeaderMobile({
  style,
  img,
  searchTerm,
  setSearchTerm,
  handleSearch,
  mobileOpen,
  setMobileOpen,
  mobileDiscoverOpen,
  setMobileDiscoverOpen,
  mobileHelpOpen,
  setMobileHelpOpen,
  router,
  isConnected,
  Discover,
  HelpCenter,
}) {
  return (
    <>
      <div className={style.header}>
        <div className={style.header_container_left}>
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Image
              className={style.header_container_left_logo}
              src={img.logo}
              alt="NFT MARKETPLACE"
            />
          </Link>
        </div>

        <button className={style.mobile_toggle} onClick={() => setMobileOpen(true)}>
          <RxHamburgerMenu />
        </button>
      </div>

      <div
        className={`${style.sidebar_overlay} ${
          mobileOpen ? style.sidebar_overlay_open : ""
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <aside className={`${style.sidebar} ${mobileOpen ? style.sidebar_open : ""}`}>
        <div className={style.sidebar_header}>
          <Link href="/" onClick={() => setMobileOpen(false)}>
            <Image src={img.logo} alt="NFT MARKETPLACE" width={40} height={40} />
          </Link>
          <button className={style.sidebar_close} onClick={() => setMobileOpen(false)}>
            <IoClose />
          </button>
        </div>
        <div className={style.sidebar_search}>
          <input
            type="text"
            placeholder="Search NFT"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>
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
            onClick={() => setMobileDiscoverOpen((v) => !v)}
          >
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
            onClick={() => setMobileHelpOpen((v) => !v)}
          >
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
            }}
          >
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
                (!authenticationStatus || authenticationStatus === "authenticated");

              if (!connected) {
                return (
                  <button
                    onClick={() => {
                      openConnectModal();
                    }}
                    type="button"
                    className={style.sidebar_primary_button}
                  >
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className={style.sidebar_primary_button}
                  >
                    Wrong network
                  </button>
                );
              }
              return (
                <>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className={style.sidebar_primary_button}
                  >
                    {account.displayName}
                  </button>
                  {isConnected && (
                    <Link href="/profile" onClick={() => setMobileOpen(false)}>
                      <button className={style.sidebar_primary_button}>Profile</button>
                    </Link>
                  )}
                </>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </aside>
    </>
  );
}

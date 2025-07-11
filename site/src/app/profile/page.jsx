"use client";
import React, { useState, useEffect  } from "react";
import Style from "./page.module.css";
import img from "../../../public/img";
import Image from "next/image";
import { ethers } from "ethers";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function Profile() {
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [listings, setListings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState("MyNFTs");

  const [ethUsd, setEthUsd] = useState(null);
  const [portfolioUsd, setPortfolioUsd] = useState(null);

  const router = useRouter();

  // 1) load wallet address
  useEffect(() => {
    const addr = localStorage.getItem("walletAddress");
    if (!addr) {
      router.replace("/");
      return;
    }
    setAddress(addr);

    // 2) fetch profile data
    (async () => {
      const res = await fetch(`/api/profile?address=${addr}`);
      const data = await res.json();
      setNfts(data.nfts);
      setListings(data.listings);
      setTransactions(data.transactions);
    })();

    // 3) fetch on-chain balance
    (async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const bal = await provider.getBalance(addr);
      setBalance(ethers.formatEther(bal));
    })();
    +    // fetch ETH→USD spot price
    (async () => {
      try {
        const resp = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
        );
        const json = await resp.json();
        const rate = json.ethereum.usd;
        setEthUsd(rate);
      } catch {
        console.error("Failed to fetch ETH price");
      }
    })();
  }, []);

  // recalc portfolio value whenever listings or ethUsd update
  useEffect(() => {
    if (ethUsd !== null && listings.length) {
      const totalEth = listings.reduce((sum, l) => sum + l.price, 0);
      setPortfolioUsd((totalEth * ethUsd).toFixed(2));
    }
  }, [ethUsd, listings]);

  if (address === null) return null;
  // helper to truncate
  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <div className={Style.Profile}>
      <div className={Style.Profile_header}>
        <div className={Style.Profile_header_avatar}>
          <Image
            src={img.user1}
            className={Style.Profile_header_avatar_img}
            alt="NFT image"
            width={70}
            height={70}
          />
        </div>
        <div className={Style.Profile_info}>
          <h2>{short}</h2>
          <div className={Style.Profile_info_wallet}>
            <p>Wallet Address: {address}</p>
            <p>balance: {balance ?? "…"} ETH</p>
          </div>
        </div>
      </div>
      <div className={Style.Profile_summery}>
        <div className={Style.Profile_summery_card}>
          <h2>{nfts.length}</h2>
          <p>Owned NFTs</p>
        </div>
        <div className={Style.Profile_summery_card}>
          <h2>{listings.length}</h2>
          <p>Active Listings</p>
        </div>
        <div className={Style.Profile_summery_card}>
          <h2>
            { portfolioUsd !== null
              ? `≈ $${portfolioUsd}`
              : "≈ $—" }
          </h2>
          <p>Portfolio Value</p>
        </div>
      </div>
          {/* tabs */}
      <div className={Style.Profile_tabs}>
        {["MyNFTs","ActiveListings","TransactionHistory"].map(tab => (
          <button
            key={tab}
            className={Style.Profile_tabs_btn}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "MyNFTs"             ? "My NFTs"
           : tab === "ActiveListings"     ? "Active Listings"
           : "Transaction History"}
          </button>
        ))}
      </div>

      {/* tab panels */}
      {activeTab === "MyNFTs" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Owned NFTs</h2>
          <div className={Style.Profile_MyNFTs_NFTGrid}>
            {nfts.map(nft => (
              <div key={nft.id} className={Style.Profile_MyNFTs_NFTGrid_card}>
                <Image
                  src={nft.metadata.imageUrl}
                  alt={nft.metadata.title}
                  width={200} height={200}
                  className={Style.Profile_MyNFTs_NFTGrid_card_img}
                />
                <div className={Style.Profile_MyNFTs_NFTGrid_card_info}>
                  <h3>{nft.metadata.title}</h3>
                  <p>{nft.metadata.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "ActiveListings" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Active Listings</h2>
          <div className={Style.Profile_MyNFTs_list}>
            {listings.map(list => (
              <button key={list.id} className={Style.Profile_MyNFTs_list_item}>
                {list.nft.metadata.title} – {list.price} ETH
                <div className={Style.Profile_MyNFTs_list_item_btns}>
                  <MdDeleteForever
                    className={Style.Profile_MyNFTs_list_item_btns_btn}
                  />
                  <MdEdit
                    className={Style.Profile_MyNFTs_list_item_btns_btn}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === "TransactionHistory" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Transaction History</h2>
          <div className={Style.Profile_TransactionHistory_list}>
            {transactions.map(tx => (
              <div key={tx.id} className={Style.Profile_TransactionHistory_list_item}>
                {tx.buyerId === address ? "Bought" : "Sold"}{" "}
                {tx.nft.metadata.title} – {tx.price} ETH
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

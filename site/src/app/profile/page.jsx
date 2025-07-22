// src/app/profile/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import Style from "./page.module.css";
import img from '@/lib/img'
import Image from "next/image";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { useAccount, useBalance } from "wagmi";
import Link from "next/link";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("MyNFTs");
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ addressOrName: address });
  const [profileData, setProfileData] = useState({
    nfts: [],
    listings: [],
    transactions: [],
  });

  useEffect(() => {
    if (!isConnected) return;
    fetch(`/api/profile?address=${address}`)
      .then((res) => res.json())
      .then((data) => setProfileData(data));
  }, [address, isConnected]);

  if (!isConnected) {
    return <p>Please connect your wallet to view your profile.</p>;
  }

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
          <h2>{address}</h2>
          <div className={Style.Profile_info_wallet}>
            <p>Wallet Address: {address}</p>
            <p>
              Balance:{" "}
              {balanceData
                ? `${balanceData.formatted} ${balanceData.symbol}`
                : "0.00 ETH"}
            </p>
          </div>
        </div>
      </div>
      <div className={Style.Profile_summery}>
        <div className={Style.Profile_summery_card}>
          <h2>{profileData.nfts.length}</h2>
          <p>Owned NFTs</p>
        </div>
        <div className={Style.Profile_summery_card}>
          <h2>{profileData.listings.length}</h2>
          <p>Active Listings</p>
        </div>
        <div className={Style.Profile_summery_card}>
          <h2>
            $
            {profileData.listings
              .reduce((sum, listing) => sum + listing.price, 0)
              .toFixed(2)}
          </h2>
          <p>Portfolio Value</p>
        </div>
      </div>
      <div className={Style.Profile_tabs}>
        <button
          className={Style.Profile_tabs_btn}
          onClick={() => setActiveTab("MyNFTs")}>
          My NFTs
        </button>
        <button
          className={Style.Profile_tabs_btn}
          onClick={() => setActiveTab("ActiveListings")}>
          {" "}
          Active Listings
        </button>
        <button
          className={Style.Profile_tabs_btn}
          onClick={() => setActiveTab("TransactionHistory")}>
          {" "}
          Transaction history
        </button>
      </div>

      {activeTab == "MyNFTs" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Owned NFTs</h2>
          {profileData.nfts.length > 0 ? (
            <div className={Style.Profile_MyNFTs_NFTGrid}>
              {profileData.nfts.map((nft) => (
                <Link
                  key={nft.id}
                  href={`/nftdetails/${nft.tokenId}`}
                  className={Style.Profile_MyNFTs_NFTGrid_card}>
                  {" "}
                  <Image
                    src={nft.imageUrl}
                    width={200}
                    height={200}
                    alt={nft.title}
                    className={Style.Profile_MyNFTs_NFTGrid_card_img}
                  />
                  <div className={Style.Profile_MyNFTs_NFTGrid_card_info}>
                    <h3>{nft.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No NFTs owned yet.</p>
          )}
        </div>
      )}

      {activeTab === "ActiveListings" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Active Listings</h2>
          {profileData.listings.length > 0 ? (
            <div className={Style.Profile_MyNFTs_list}>
              {profileData.listings.map((listing) => (
                <button
                  key={listing.id}
                  className={Style.Profile_MyNFTs_list_item}>
                  {listing.nft.title} - Price: {listing.price} ETH
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
          ) : (
            <p>No active listings.</p>
          )}
        </div>
      )}

      {activeTab == "TransactionHistory" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Transaction History</h2>
          {profileData.transactions.length > 0 ? (
            <div className={Style.Profile_TransactionHistory_list}>
              {profileData.transactions.map((tx) => {
                const isSeller = tx.seller.walletAddress === address;
                return (
                  <div
                    key={tx.id}
                    className={Style.Profile_TransactionHistory_list_item}>
                    {isSeller ? "Sold" : "Bought"} {tx.nft.title} - Price:{" "}
                    {tx.price} ETH
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No transactions yet.</p>
          )}
        </div>
      )}
    </div>
  );
};
export default Profile;

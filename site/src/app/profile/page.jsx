'use client'
import React, { useState } from "react";
import Style from "./page.module.css";
import img from "../../../public/img";
import Image from "next/image";
import { MdDeleteForever, MdEdit } from "react-icons/md";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("MyNFTs");

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
          <h2>Username</h2>
          <div className={Style.Profile_info_wallet}>
            <p>Wallet Address: xxxxxxxxxxxxxxxxxxx</p>
            <p>balance:0 ETH</p>
          </div>
        </div>
      </div>
      <div className={Style.Profile_summery}>
        <div className={Style.Profile_summery_card}>
          <h2>10</h2>
          <p>Owned NFTs</p>
        </div>
        <div className={Style.Profile_summery_card}>
          <h2>3</h2>
          <p>Active Listings</p>
        </div>
        <div className={Style.Profile_summery_card}>
          <h2>$15K</h2>
          <p>Portfolio Value</p>
        </div>
      </div>
      <div className={Style.Profile_tabs}>
        <button
          className={Style.Profile_tabs_btn}
          onClick={() => setActiveTab("MyNFTs")}
        >
          My NFTs
        </button>
        <button
          className={Style.Profile_tabs_btn}
          onClick={() => setActiveTab("ActiveListings")}
        >
          {" "}
          Active Listings
        </button>
        <button
          className={Style.Profile_tabs_btn}
          onClick={() => setActiveTab("TransactionHistory")}
        >
          {" "}
          Active Listings
        </button>
      </div>

      {activeTab == "MyNFTs" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Owned NFTs</h2>
          <div className={Style.Profile_MyNFTs_NFTGrid}>
            <div className={Style.Profile_MyNFTs_NFTGrid_card}>
              <Image
                src={img.user1}
                className={Style.Profile_MyNFTs_NFTGrid_card_img}
                alt="NFT image"
                width={200}
                height={200}
              />
              <div className={Style.Profile_MyNFTs_NFTGrid_card_info}>
                <h3>NFT 1</h3>
                <p>Artist Name</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab == "ActiveListings" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Active Listings</h2>
          <div className={Style.Profile_MyNFTs_list}>
            <button className={Style.Profile_MyNFTs_list_item}>
              NFT 1 - Price: 1 ETH
              <div className={Style.Profile_MyNFTs_list_item_btns}>
                <MdDeleteForever
                  className={Style.Profile_MyNFTs_list_item_btns_btn}
                />
                <MdEdit className={Style.Profile_MyNFTs_list_item_btns_btn} />
              </div>
            </button>
          </div>
        </div>
      )}
      {activeTab == "TransactionHistory" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Transaction History</h2>
          <div className={Style.Profile_TransactionHistory_list}>
            <div className={Style.Profile_TransactionHistory_list_item}>
              Sold NFT 1 - Price: 1 ETH
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

"use client";
import React from "react";
import Style from "./ProfileTabs.module.css";

import MyNFTs from "./MyNFTs/MyNFTs";
import ActiveListings from "./ActiveListings/ActiveListings";
import TransactionHistory from "./TransactionHistory/TransactionHistory";

export default function ProfileTabs({
  //$ for profile tabs
  active,
  onChange,

  //$ for MyNFTs
  myNftsItems,
  myNftsLoading,
  resellingId,
  onResellClick,

  //$ for ActiveListings
  listings,
  cancellingId,
  onCancelListing,

  //$ for TransactionHistory
  transactions,
  address,
  txPage,
  txPageSize,
  totalPages,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onPageSizeChange,
}) {
  return (
    <div>
      <div className={Style.Profile_tabs}>
        <button
          className={`${Style.Profile_tabs_btn} ${
            active === "MyNFTs" ? Style.Active : ""
          }`}
          onClick={() => onChange("MyNFTs")}>
          My NFTs
        </button>
        <button
          className={`${Style.Profile_tabs_btn} ${
            active === "ActiveListings" ? Style.Active : ""
          }`}
          onClick={() => onChange("ActiveListings")}>
          Active listings
        </button>
        <button
          className={`${Style.Profile_tabs_btn} ${
            active === "TransactionHistory" ? Style.Active : ""
          }`}
          onClick={() => onChange("TransactionHistory")}>
          Transaction history
        </button>
      </div>

      {active === "MyNFTs" && (
        <MyNFTs
          items={myNftsItems}
          loading={myNftsLoading}
          resellingId={resellingId}
          onResellClick={onResellClick}
        />
      )}

      {active === "ActiveListings" && (
        <ActiveListings
          listings={listings}
          cancellingId={cancellingId}
          onCancel={onCancelListing}
        />
      )}

      {active === "TransactionHistory" && (
        <TransactionHistory
          transactions={transactions}
          address={address}
          page={txPage}
          pageSize={txPageSize}
          totalPages={totalPages}
          onFirst={onFirst}
          onPrev={onPrev}
          onNext={onNext}
          onLast={onLast}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}

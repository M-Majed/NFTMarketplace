"use client";
import React from "react";
import Link from "next/link";
import { MdDeleteForever } from "react-icons/md";
import Style from "./ActiveListings.module.css";

export default function ActiveListings({
  listings = [],
  cancellingId = null,
  onCancel,
}) {
  return (
    <div className={Style.Profile_MyNFTs}>
      <h2>Active Listings</h2>
      {listings.length > 0 ? (
        <div className={Style.Profile_MyNFTs_list}>
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/nftdetails/${listing.tokenId}`}
              className={Style.Profile_MyNFTs_list_item}>
              {listing.nft?.name ?? `Token #${listing.tokenId}`} - Price:{" "}
              {listing.price} ETH
              <div className={Style.Profile_MyNFTs_list_item_btns}>
                <MdDeleteForever
                  className={`${Style.Profile_MyNFTs_list_item_btns_btn} ${
                    cancellingId === listing.id ? Style.isBusyIcon : ""
                  }`}
                  onClick={(e) => {
                    e.preventDefault(); //* prevent navigation
                    e.stopPropagation(); //* prevent parent navigation
                    onCancel?.(listing, e);
                  }}
                  title={
                    cancellingId === listing.id
                      ? "Cancelling…"
                      : "Cancel listing"
                  }
                />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No active listings.</p>
      )}
    </div>
  );
}

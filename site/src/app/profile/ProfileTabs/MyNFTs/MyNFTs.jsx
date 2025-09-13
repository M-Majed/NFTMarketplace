"use client";
import React from "react";
import Image from "next/image";
import Style from "./MyNFTs.module.css";

export default function MyNFTs({
  items = [],
  loading = false,
  resellingId = null,
  onResellClick,
}) {
  return (
    <div className={Style.Profile_MyNFTs}>
      <h2>Owned NFTs</h2>
      {loading ? (
        <p>Loading your on-chain NFTs…</p>
      ) : items.length > 0 ? (
        <div className={Style.Profile_MyNFTs_NFTGrid}>
          {items.map((nft) => (
            <div
              key={nft.tokenId}
              className={`${Style.Profile_MyNFTs_NFTGrid_card} ${
                resellingId === nft.tokenId ? Style.isBusy : ""
              }`}
              onClick={(e) => (resellingId ? null : onResellClick?.(nft, e))}
              title={
                resellingId === nft.tokenId
                  ? "Listing…"
                  : "Click to list for sale"
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault(); //* prevent scrolling on space
                  resellingId ? null : onResellClick?.(nft, e);
                }
              }}>
              <Image
                src={nft.image}
                width={200}
                height={200}
                alt={nft.name || `Token #${nft.tokenId}`}
                className={Style.Profile_MyNFTs_NFTGrid_card_img}
                sizes="(max-width: 600px) 45vw, 200px"
              />
              <div className={Style.Profile_MyNFTs_NFTGrid_card_info}>
                <h3>{nft.name || `Token #${nft.tokenId}`}</h3>
                <small>
                  {resellingId === nft.tokenId
                    ? "Listing…"
                    : "Click to list for sale"}
                </small>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No NFTs owned yet (on-chain).</p>
      )}
    </div>
  );
}

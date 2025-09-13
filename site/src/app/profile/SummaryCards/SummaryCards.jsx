"use client";
import React from "react";
import Style from "./SummaryCards.module.css";

export default function SummaryCards({
  ownedCount,
  activeCount,
  activeListingsValueUsd,
}) {
  return (
    <div className={Style.Profile_summery}>
      <div className={Style.Profile_summery_card}>
        <h2>{ownedCount === null ? "…" : ownedCount}</h2>
        <p>Owned NFTs</p>
      </div>

      <div className={Style.Profile_summery_card}>
        <h2>{activeCount}</h2>
        <p>Active Listings</p>
      </div>

      <div className={Style.Profile_summery_card}>
        <h2>${activeListingsValueUsd}</h2>
        <p>Active listings Value</p>
      </div>
    </div>
  );
}

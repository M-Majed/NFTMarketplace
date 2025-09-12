// src/app/profile/SummaryCards/SummaryCards.jsx
"use client";
import React from "react";
import Style from "./SummaryCards.module.css"; // for future overrides

export default function SummaryCards({
  ownedCount,        // number | null (null => show loading ellipsis)
  activeCount,       // number
  portfolioValueUsd, // string | number
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
        <h2>${portfolioValueUsd}</h2>
        <p>Portfolio Value</p>
      </div>
    </div>
  );
}

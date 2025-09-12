// src/app/profile/ProfileHeader/ProfileHeader.jsx
"use client";
import React from "react";
import Style from "./ProfileHeader.module.css"; // reserved for overrides if needed
import Image from "next/image";
import img from "@/lib/img";
import { formatEther } from "viem";

export default function ProfileHeader({
  address,
  loadingPending,
  pendingWei,
  withdrawing,
  onWithdrawAll,
}) {
  return (
    <div className={Style.Profile_header}>
      <div className={Style.Profile_header_avatar}>
        <Image
          src={img.user1}
          className={Style.Profile_header_avatar_img}
          alt="NFT image"
          width={70}
          height={70}
          sizes="(max-width: 600px) 56px, 70px"
        />
      </div>

      <div className={Style.Profile_info}>
        <h2>{address}</h2>

        <div className={Style.Profile_info_wallet}>
          <p>Wallet Address: {address}</p>

          <div className={Style.Profile_info_actions}>
            <span>
              Balance:&nbsp;
              {loadingPending
                ? "…"
                : `${Number(formatEther(pendingWei)).toFixed(4)} ETH`}
            </span>

            <button
              className={`${Style.Button} ${Style.ButtonPrimary}`}
              onClick={onWithdrawAll}
              disabled={withdrawing || pendingWei === 0n}
              title={
                pendingWei === 0n ? "No earnings to withdraw" : "Withdraw all earnings"
              }
            >
              {withdrawing ? "Withdrawing…" : "Withdraw"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

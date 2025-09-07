// src/app/nftdetails/[nftId]/page.jsx
import React from "react";

import Style from "./page.module.css";
import NFTDetailsImg from "./NFTDetailsImg/NFTDetailsImg";
import NFTDescription from "./NFTDescription/NFTDescription";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function NFTDetailsPage({ params }) {
  const { tokenId } = params;

  // Find the active listing by the NFT’s tokenId
  const listing = await prisma.listing.findFirst({
    where: {
      active: true,
      nft: { tokenId: parseInt(tokenId) },
    },
    include: {
      nft: true,
      seller: true,
    },
  });

  if (!listing) {
    return <p>NFT not found.</p>;
  }

  // 1) Fetch the ETH→USD spot price
  const priceRes = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
    { next: { revalidate: 60 } }
  );
  const priceData = await priceRes.json();
  const ethUsd = priceData.ethereum.usd;

  // 2) Compute this NFT’s USD value
  const usdPrice = (listing.price * ethUsd).toFixed(2);

  return (
    <div className={Style.NFTDetailsPage}>
      <NFTDetailsImg nft={listing.nft} listing={listing} />
      <NFTDescription
        nft={listing.nft}
        seller={listing.seller}
        price={listing.price}
        usdPrice={usdPrice}
        listingId={listing.id}
      />
    </div>
  );
}

import React from "react";
import Style from "./page.module.css";
import NFTDetailsImg from "./NFTDetailsImg/NFTDetailsImg";
import NFTDescription from "./NFTDescription/NFTDescription";
import { prisma } from "@/lib/prisma";


export default async function NFTDetailsPage({ params }){
  const { tokenId } = params;

  //$ find the active listing for this tokenId
  const listing = await prisma.listing.findFirst({
    where: {
      active: true,
      nft: { tokenId: parseInt(tokenId) },
    },
    include: {
      nft: true,
      seller: true
    },
  });

  //$ Handle listing not found
  if (!listing) {
    return <p>NFT not found.</p>;
  }

  //$ Fetch the ETH->USD price - compute NFT price in USD
  const priceRes = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    { next: { revalidate: 60 } }
  );
  const priceData = await priceRes.json();
  const ethUsd = priceData.ethereum.usd;
  const usdPrice = (listing.price * ethUsd).toFixed(2);

  return (
    <div className={Style.NFTDetailsPage}>
      <NFTDetailsImg listing={listing} />
      <NFTDescription
        usdPrice={usdPrice}
        listing={listing}
      />
    </div>
  );
};
import React from "react";

//INTERNAL IMPORT
import Style from "./page.module.css";
import NFTDetailsImg from "./NFTDetailsImg/NFTDetailsImg";
import NFTDescription from "./NFTDescription/NFTDescription";
export const revalidate = 60;

export default async function NFTDetailsPage({ params }){
  const { nftId } = params;

  // Find the active listing by the NFT’s tokenId
  const listing = await prisma.listing.findFirst({
    where: {
      status: 'ACTIVE',
      nft: { tokenId: nftId },
    },
    include: {
      nft: true,      // brings in title, description, imageUrl, tokenId, etc.
      seller: true    // in case you want seller.name or seller.avatarUrl
    },
  });

  if (!listing) {
    return <p>NFT not found.</p>;
  }

  // 1. Fetch the ETH→USD spot price
  const priceRes = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    { next: { revalidate: 60 } }     // ISR: refresh every 60s
  );
  const priceData = await priceRes.json();
  const ethUsd = priceData.ethereum.usd;  // e.g. 3221.22

  // 2. Compute this NFT’s USD value
  const usdPrice = (listing.price * ethUsd).toFixed(2);

  return (
    <div className={Style.NFTDetailsPage}>
      <NFTDetailsImg nft={listing.nft} listing={listing} />
      <NFTDescription
        nft={listing.nft}
        seller={listing.seller}
        price={listing.price}
        usdPrice={usdPrice}
      />
    </div>
  );
};
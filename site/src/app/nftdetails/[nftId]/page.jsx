import React from "react";

//INTERNAL IMPORT
import Style from "./page.module.css";
import NFTDetailsImg from "./NFTDetailsImg/NFTDetailsImg";
import NFTDescription from "./NFTDescription/NFTDescription";

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

  return (
    <div className={Style.NFTDetailsPage}>
      <NFTDetailsImg nft={listing.nft}/>
      <NFTDescription         
      nft={listing.nft}
      seller={listing.seller}
      price={listing.price}/>
    </div>
  );
};
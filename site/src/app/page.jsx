// src/app/page.jsx
import React from "react";
import Introduction from "@/components/1_MainPage/Introduction/Introduction";
import Service from "@/components/1_MainPage/Service/Service";
import BigNFTSilder from "@/components/1_MainPage/BigNFTSlider/BigNFTSlider";
import Category from "@/components/1_MainPage/Category/Category";
import { prisma } from "@/lib/prisma";
export const revalidate = 60; // optional ISR
import { fetchNFTs } from "@/context/NFTMarketplaceContext";

export default async function Home() {
  // // 1) Define your categories
  // const categoryNames = [
  //   "Art",
  //   "Game",
  //   "Nature",
  //   "Sport",
  //   "Portrait",
  //   "Animal",
  // ];

  // // 2) For each, count ACTIVE listings whose related NFT has that category
  // const categories = await Promise.all(
  //   categoryNames.map(async (name) => {
  //     const count = await prisma.listing.count({
  //       where: {
  //         status: "ACTIVE",
  //         nft: { category: name },
  //       },
  //     });
  //     return { name, count };
  //   })
  // );

  // // 1) fetch your 5 random listings (as before)
  // const all = await prisma.listing.findMany({
  //   where: { status: 'ACTIVE' },
  //   select: { id: true }
  // });
  // const ids = all.map(l => l.id).sort(() => Math.random() - .5).slice(0,5);
  // const listings = await prisma.listing.findMany({
  //   where: { id: { in: ids } },
  //   include: { nft: true, seller: true }
  // });

  // // 2) fetch ETH→USD
  // const priceRes = await fetch(
  //   'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
  //   { next: { revalidate: 60 } }
  // );
  // const { ethereum } = await priceRes.json();
  // const ethUsd = ethereum.usd;

  // // 3) enrich listings with usdPrice
  // const enriched = listings.map(l => ({
  //   ...l,
  //   usdPrice: parseFloat((l.price * ethUsd).toFixed(2))
  // }));

  return (
    <div>
      <Introduction />
      <Service />
      {/* <BigNFTSilder listings={enriched} /> */}
      {/* <Category items={categories}/> */}
    </div>
  );
}

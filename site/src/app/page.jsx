import React from "react";
import Introduction from "@/components/1_MainPage/Introduction/Introduction";
import Service from "@/components/1_MainPage/Service/Service";
import BigNFTSilder from "@/components/1_MainPage/BigNFTSlider/BigNFTSlider";
import Category from "@/components/1_MainPage/Category/Category";
import { prisma } from "@/lib/prisma";
export const revalidate = 60;
import { categories } from "./constants";

export default async function Home() {
  const categoryNames = categories.map(c => c.category);

  // For Category component: count nft listings per category
  const countCategoriesNfts = await Promise.all(
    categoryNames.map(async (name) => {
      const count = await prisma.listing.count({
        where: {
          active: true,
          category: name,
        },
      });
      return { name, count };
    })
  );

  // For BigNFTSlider component: fetch 5 random listings
  const all = await prisma.listing.findMany({
    where: { active: true },
    select: { id: true }
  });
  const ids = all.map(l => l.id).sort(() => Math.random() - .5).slice(0,5); // 5 random ids
  const listings = await prisma.listing.findMany({
    where: { id: { in: ids } },
    include: { nft: true, seller: true }
  }); // 5 random listings

  // Fetch ETH->USD price
  const priceRes = await fetch(
    'https:// Api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
    { next: { revalidate: 60 } }
  );
  const { ethereum } = await priceRes.json();
  const ethUsd = ethereum.usd;

  // Add usdPrice to each listing
  const completedListings = listings.map(l => ({
    ...l,
    usdPrice: parseFloat((l.price * ethUsd).toFixed(2))
  }));

  return (
    <div>
      <Introduction />
      <Service />
      <BigNFTSilder listings={completedListings} />
      <Category items={countCategoriesNfts}/>
    </div>
  );
}

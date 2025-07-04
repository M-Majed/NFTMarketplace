import React from "react";
import Introduction from "@/components/1_MainPage/Introduction/Introduction";
import Service from "@/components/1_MainPage/Service/Service";
import BigNFTSilder from "@/components/1_MainPage/BigNFTSlider/BigNFTSlider";
import Category from "@/components/1_MainPage/Category/Category";
import { prisma } from "@/lib/prisma";
export const revalidate = 60; // optional ISR

export default async function Home() {
  // 1) Define your categories
  const categoryNames = [
    "Art",
    "Game",
    "Nature",
    "Sport",
    "Portrait",
    "Animal",
  ];

  // 2) For each, count ACTIVE listings whose related NFT has that category
  const categories = await Promise.all(
    categoryNames.map(async (name) => {
      const count = await prisma.listing.count({
        where: {
          status: "ACTIVE",
          nft: { category: name },
        },
      });
      return { name, count };
    })
  );

  // 1) grab all active IDs
  const all = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    select: { id: true },
  });

  // 2) shuffle & pick 5
  const ids = all
    .map((l) => l.id)
    .sort(() => Math.random() - 0.5) // quick shuffle
    .slice(0, 5);

  // 3) fetch the full records
  const listings = await prisma.listing.findMany({
    where: { id: { in: ids } },
    include: { nft: true, seller: true },
  });

  return (
    <div>
      <Introduction />
      <Service />
      <BigNFTSilder listings={listings} />
      <Category items={categories}/>
    </div>
  );
}

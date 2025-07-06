import React from "react";
import NFTCard from "./NFTCard/NFTCard";
import { prisma } from "@/lib/prisma";

export default async function MarketplacePage({ searchParams }) {
  const { category: catParam, search, minPrice, maxPrice } = searchParams;
  const categories = catParam
    ? Array.isArray(catParam)
      ? catParam
      : [catParam]
    : [];

  const priceFilter = {};
  if (minPrice) priceFilter.gte = parseFloat(minPrice);
  if (maxPrice) priceFilter.lte = parseFloat(maxPrice);

  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      // category filter
      ...(categories.length > 0
        ? { nft: { category: { in: categories } } }
        : {}),
      // price filter
      ...(Object.keys(priceFilter).length > 0
        ? { price: priceFilter }
        : {}),
      // search filter
     ...(search
       ? {
           OR: [
             { nft: { title:       { contains: search } } },
             { nft: { description: { contains: search } } },
           ],
         }
       : {}),
  },
  include: { nft: true, seller: true },
});

  return <NFTCard items={listings} />;
}

import React from 'react'
import NFTCard from './NFTCard/NFTCard';
import { prisma } from '@/lib/prisma';

export default async function MarketplacePage({ searchParams }) {
  // handle single or multiple ?category= values
  const { category: catParam, minPrice, maxPrice } = searchParams;
  const categories = catParam
    ? Array.isArray(catParam)
      ? catParam
      : [catParam]
    : [];
  // build a price filter only when minPrice or maxPrice is set
  const priceFilter = {};
  if (minPrice) priceFilter.gte = parseFloat(minPrice);
  if (maxPrice) priceFilter.lte = parseFloat(maxPrice);

  const listings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
      // if any categories selected, filter with IN
      ...(categories.length > 0
         ? { nft: { category: { in: categories } } }
         : {}),
      // apply priceFilter if either bound exists
      ...(Object.keys(priceFilter).length > 0
         ? { price: priceFilter }
         : {}),
    },
    include: { 
      nft: true,        // brings in tokenId, imageUrl, title, etc.
      seller: true      // if you need seller.name or avatar
    },
  })

  return (
    <NFTCard
      items={listings}
      initialCategory={catParam  || null}
    />
  );
};
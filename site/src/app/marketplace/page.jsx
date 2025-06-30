import React from 'react'
import NFTCard from './NFTCard/NFTCard';
import { prisma } from '@/lib/prisma';

export default async function MarketplacePage({ searchParams }) {

  const { category } = searchParams;
  const listings = await prisma.listing.findMany({
    where: {
      status: 'ACTIVE',
      // only filter by category if one was passed
      ...(category && category !== 'All'
         ? { nft: { category } }
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
      initialCategory={category || null}
    />
  );
};
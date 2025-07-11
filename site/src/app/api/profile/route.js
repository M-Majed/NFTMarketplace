// src/app/api/profile/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  // 1) Owned NFTs
  const nfts = await prisma.nFT.findMany({
    where: { ownerId: address },
  });

  // 2) Active listings
  const listings = await prisma.listing.findMany({
    where: { sellerId: address, status: "ACTIVE" },
    include: { nft: true },
  });

  // 3) Transactions (buy or sell)
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { buyerId: address },
        { sellerId: address },
      ]
    },
    include: { nft: true, buyer: true, seller: true },
    orderBy: { timestamp: "desc" },
  });

  return NextResponse.json({ nfts, listings, transactions });
}

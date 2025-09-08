// src/app/api/profile/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // 1) Find the user by walletAddress
    const user = await prisma.user.findUnique({
      where: { walletAddress: address },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 2) Fetch NFTs they own
    const nfts = await prisma.nFT.findMany({
      where: { ownerId: user.id },
      // Pull in the metadata JSON so the client can read title/image/etc.
      select: { id: true, name: true, imageUrl: true, tokenId:true  },
    });

    // 3) Fetch their active listings
    const listings = await prisma.listing.findMany({
      where: { sellerId: user.id, active: true },
      include: {
        nft: { select: { id: true, name:true  } },
      },
    });

    // 4) Fetch all transactions (bought or sold)
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { buyerId:  user.id },
          { sellerId: user.id },
        ],
      },
      include: {
        nft:    { select: { id: true, name: true } },
        buyer:  { select: { walletAddress: true } },
        seller: { select: { walletAddress: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ nfts, listings, transactions });
  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
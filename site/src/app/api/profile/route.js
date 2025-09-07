// route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams: search_params } = new URL(request.url);
    const wallet_address = search_params.get("address");
    if (!wallet_address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // 1) Find the user by walletAddress
    const user_record = await prisma.user.findUnique({
      where: { walletAddress: wallet_address },
      select: { id: true },
    });
    if (!user_record) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2) Fetch NFTs they own
    const nfts = await prisma.nFT.findMany({
      where: { ownerId: user_record.id },
      select: { id: true, name: true, imageUrl: true, tokenId: true },
    });

    // 3) Fetch their active listings
    const listings = await prisma.listing.findMany({
      where: { sellerId: user_record.id, active: true },
      include: {
        nft: { select: { id: true, name: true } },
      },
    });

    // 4) Fetch all transactions (bought or sold)
    const transactions = await prisma.transaction.findMany({
      where: {
        OR: [{ buyerId: user_record.id }, { sellerId: user_record.id }],
      },
      include: {
        nft: { select: { id: true, name: true } },
        buyer: { select: { walletAddress: true } },
        seller: { select: { walletAddress: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ nfts, listings, transactions });
  } catch (err) {
    console.error("Profile API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

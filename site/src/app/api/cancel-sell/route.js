// app/api/listings/cancel/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { tokenId, walletAddress, txHash } = await req.json();

    if (typeof tokenId !== "number")
      return NextResponse.json({ ok: false, error: "tokenId (number) required" }, { status: 400 });
    if (!walletAddress)
      return NextResponse.json({ ok: false, error: "walletAddress required" }, { status: 400 });

    // Find the user calling cancel
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    // Make sure the listing exists and belongs to this user
    const listing = await prisma.listing.findUnique({
      where: { tokenId },
      select: { id: true, active: true, sellerId: true },
    });
    if (!listing) {
      return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
    }
    if (listing.sellerId !== user.id) {
      return NextResponse.json({ ok: false, error: "Not the listing seller" }, { status: 403 });
    }

    const [updatedListing, updatedNft] = await prisma.$transaction([
      prisma.listing.update({
        where: { tokenId },
        data: { active: false },
      }),
      prisma.nFT.update({
        // Model name is NFT → client accessor is nFT
        where: { tokenId },
        data: { ownerId: user.id },
      }),
    ]);

    // If you later want to log tx, add a Transaction row here (enum lacks CANCEL today).

    return NextResponse.json({
      ok: true,
      listing: updatedListing,
      nft: updatedNft,
      txHash: txHash ?? null,
    });
  } catch (err) {
    console.error("Cancel API error:", err);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}

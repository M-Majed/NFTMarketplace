import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs";
const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { tokenId, walletAddress, txHash } = await req.json();

    //* Basic validation
    if (typeof tokenId !== "number")
      return NextResponse.json({ ok: false, error: "tokenId (number) required" }, { status: 400 });
    if (!walletAddress)
      return NextResponse.json({ ok: false, error: "walletAddress required" }, { status: 400 });

    //* Find the user calling cancel
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    //* Find the listing to be canceled
    const listing = await prisma.listing.findUnique({
      where: { tokenId },
      select: { id: true, active: true, sellerId: true },
    });

    //* Validations
    if (!listing) {
      return NextResponse.json({ ok: false, error: "Listing not found" }, { status: 404 });
    }
    if (listing.sellerId !== user.id) {
      return NextResponse.json({ ok: false, error: "Not the listing seller" }, { status: 403 });
    }
    if (!listing.active) {
      return NextResponse.json({ ok: false, error: "Listing is already inactive" }, { status: 400 });
    }

    //* Update listing to inactive and transfer NFT ownership back to seller
    const [updatedListing, updatedNft] = await prisma.$transaction([
      prisma.listing.update({
        where: { tokenId },
        data: { active: false },
      }),
      prisma.nFT.update({
        where: { tokenId },
        data: { ownerId: user.id },
      }),
    ]);

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

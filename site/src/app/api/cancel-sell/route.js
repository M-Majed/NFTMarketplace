import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs";
const prisma = new PrismaClient();
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const { tokenId, txHash } = await req.json();
    const session = await getServerSession(authOptions);
    if (!session?.user?.address) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const sessionAddress = session.user.address.toLowerCase();

    //* Basic validation
    if (typeof tokenId !== "number")
      return NextResponse.json({ ok: false, error: "tokenId (number) required" }, { status: 400 });

    //* Ensure the caller (session wallet) exists in DB
    const user = await prisma.user.upsert({
      where: { walletAddress: sessionAddress },
      update: {},
      create: { walletAddress: sessionAddress },
      select: { id: true, walletAddress: true },
    });

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
    // Idempotency: if already inactive, treat as success to avoid double-fails on refresh
    if (!listing.active) {
      return NextResponse.json({ ok: true, already: true, txHash: txHash ?? null }, { status: 200 });
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

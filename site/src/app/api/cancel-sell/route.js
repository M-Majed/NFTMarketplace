// app/api/listings/cancel-sell/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const {
      tokenId: token_id,
      walletAddress: wallet_address,
      txHash: tx_hash,
    } = await request.json();

    if (typeof token_id !== "number") {
      return NextResponse.json(
        { ok: false, error: "tokenId (number) required" },
        { status: 400 }
      );
    }

    if (!wallet_address) {
      return NextResponse.json(
        { ok: false, error: "walletAddress required" },
        { status: 400 }
      );
    }

    const user_record = await prisma.user.findUnique({
      where: { walletAddress: wallet_address },
      select: { id: true },
    });

    if (!user_record) {
      return NextResponse.json(
        { ok: false, error: "User not found" },
        { status: 404 }
      );
    }

    const listing_record = await prisma.listing.findUnique({
      where: { tokenId: token_id },
      select: { id: true, active: true, sellerId: true },
    });

    if (!listing_record) {
      return NextResponse.json(
        { ok: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing_record.sellerId !== user_record.id) {
      return NextResponse.json(
        { ok: false, error: "Not the listing seller" },
        { status: 403 }
      );
    }

    const [updated_listing, updated_nft] = await prisma.$transaction([
      prisma.listing.update({
        where: { tokenId: token_id },
        data: { active: false },
      }),
      prisma.nFT.update({
        where: { tokenId: token_id },
        data: { ownerId: user_record.id },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      listing: updated_listing,
      nft: updated_nft,
      txHash: tx_hash ?? null,
    });
  } catch (err) {
    console.error("Cancel API error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

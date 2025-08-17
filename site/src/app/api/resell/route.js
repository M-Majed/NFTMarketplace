// src/app/api/resell/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { tokenId, price, walletAddress, txHash, category } =
      await req.json();
    // Optional category validation (must match Prisma enum if provided)
    const ALLOWED = ["Art", "Game", "Nature", "Sport", "Portrait", "Animal"];
    if (category !== undefined && category !== null) {
      if (typeof category !== "string" || !ALLOWED.includes(category)) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }
    // Basic validation
    if (
      tokenId === undefined ||
      tokenId === null ||
      isNaN(Number(tokenId)) ||
      Number(tokenId) <= 0
    ) {
      return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
    }
    if (!price || !/^\d+(\.\d+)?$/.test(String(price))) {
      return NextResponse.json(
        { error: "Invalid price (expected stringified ETH amount)" },
        { status: 400 }
      );
    }
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "walletAddress required" },
        { status: 400 }
      );
    }

    const tokenIdInt = Number(tokenId);
    // Load NFT + current DB owner (must exist)
    const nft = await prisma.nFT.findUnique({
      where: { tokenId: tokenIdInt },
      include: { owner: true },
    });
    if (!nft) {
      return NextResponse.json(
        {
          error:
            "NFT not found in DB. Ensure your mint/sync path writes NFT rows before listing.",
        },
        { status: 404 }
      );
    }
    if (!nft.owner) {
      return NextResponse.json(
        { error: "NFT has no owner in DB. Cannot list." },
        { status: 409 }
      );
    }
    // Verify caller matches DB owner (case-insensitive)
    if (nft.owner.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "This wallet does not own the NFT in DB." },
        { status: 403 }
      );
    }
    const seller = nft.owner;

    // Upsert listing for this tokenId (unique)
    const listing = await prisma.listing.upsert({
      where: { tokenId: tokenIdInt },
      update: {
        price: String(price),
        active: true,
        sellerId: seller.id,
        ...(category ? { category } : {}),
      },
      create: {
        tokenId: tokenIdInt,
        price: String(price),
        active: true,
        sellerId: seller.id,
        // category: optional – leave null/unchanged unless you collect it in UI
        ...(category ? { category } : {}),
      },
      include: {
        nft: true,
        seller: true,
      },
    });

    // NOTE: Not creating a Transaction here due to schema constraints (needs buyerId).
    // We'll create a SALE/RESALE transaction after purchase.

    return NextResponse.json(
      {
        ok: true,
        listing,
        txHash: txHash || null,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[api/resell] error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

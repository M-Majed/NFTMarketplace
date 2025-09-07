// route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const {
      tokenId: token_id,
      price,
      walletAddress: wallet_address,
      txHash: tx_hash,
      category,
      marketplaceAddress: marketplace_address,
    } = await request.json();

    const allowed_categories = [
      "Art",
      "Game",
      "Nature",
      "Sport",
      "Portrait",
      "Animal",
    ];
    if (category !== undefined && category !== null) {
      if (
        typeof category !== "string" ||
        !allowed_categories.includes(category)
      ) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }

    if (
      token_id === undefined ||
      token_id === null ||
      isNaN(Number(token_id)) ||
      Number(token_id) <= 0
    ) {
      return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
    }

    if (!price || !/^\d+(\.\d+)?$/.test(String(price))) {
      return NextResponse.json(
        { error: "Invalid price (expected stringified ETH amount)" },
        { status: 400 }
      );
    }

    if (!wallet_address || typeof wallet_address !== "string") {
      return NextResponse.json(
        { error: "walletAddress required" },
        { status: 400 }
      );
    }

    const token_id_int = Number(token_id);

    const nft_record = await prisma.nFT.findUnique({
      where: { tokenId: token_id_int },
      include: { owner: true },
    });
    if (!nft_record) {
      return NextResponse.json(
        {
          error:
            "NFT not found in DB. Ensure your mint/sync path writes NFT rows before listing.",
        },
        { status: 404 }
      );
    }
    if (!nft_record.owner) {
      return NextResponse.json(
        { error: "NFT has no owner in DB. Cannot list." },
        { status: 409 }
      );
    }

    if (
      nft_record.owner.walletAddress.toLowerCase() !==
      wallet_address.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "This wallet does not own the NFT in DB." },
        { status: 403 }
      );
    }
    const seller_record = nft_record.owner;

    const market_addr_raw =
      marketplace_address ||
      process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS ||
      process.env.MARKETPLACE_ADDRESS ||
      process.env.NEXT_PUBLIC_NFT_MARKETPLACE_ADDRESS ||
      process.env.NFT_MARKETPLACE_ADDRESS;

    if (!market_addr_raw || typeof market_addr_raw !== "string") {
      return NextResponse.json(
        {
          error:
            "Marketplace (contract) address missing. Pass `marketplaceAddress` in body or set an env var.",
        },
        { status: 500 }
      );
    }
    const market_addr = market_addr_raw.toLowerCase();

    const contract_user = await prisma.user.upsert({
      where: { walletAddress: market_addr },
      create: { walletAddress: market_addr },
      update: {},
    });

    const [updated_nft, listing_record] = await prisma.$transaction([
      prisma.nFT.update({
        where: { tokenId: token_id_int },
        data: { ownerId: contract_user.id },
        select: { tokenId: true, ownerId: true },
      }),
      prisma.listing.upsert({
        where: { tokenId: token_id_int },
        update: {
          price: String(price),
          active: true,
          sellerId: seller_record.id,
          ...(category ? { category } : {}),
        },
        create: {
          tokenId: token_id_int,
          price: String(price),
          active: true,
          sellerId: seller_record.id,
          ...(category ? { category } : {}),
        },
        include: { nft: true, seller: true },
      }),
    ]);

    return NextResponse.json(
      {
        ok: true,
        listing: listing_record,
        nft: updated_nft,
        txHash: tx_hash || null,
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

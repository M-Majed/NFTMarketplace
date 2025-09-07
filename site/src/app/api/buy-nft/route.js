// src/app/api/buy-nft/route.js
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const {
      tokenId: token_id,
      buyerAddress: buyer_address,
      price,
      txHash: tx_hash,
    } = await request.json();

    if (!token_id || !buyer_address || !price) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const listing_record = await prisma.listing.findUnique({
      where: { tokenId: token_id },
      include: { seller: true },
    });

    if (!listing_record || !listing_record.active) {
      return new Response(
        JSON.stringify({ error: "Active listing not found" }),
        { status: 400 }
      );
    }

    const buyer_record = await prisma.user.upsert({
      where: { walletAddress: buyer_address },
      update: {},
      create: { walletAddress: buyer_address },
    });

    await prisma.nFT.update({
      where: { tokenId: token_id },
      data: { ownerId: buyer_record.id },
    });

    await prisma.listing.update({
      where: { tokenId: token_id },
      data: { active: false },
    });

    await prisma.transaction.create({
      data: {
        tokenId: token_id,
        listingId: listing_record.id,
        buyerId: buyer_record.id,
        sellerId: listing_record.sellerId,
        price,
        type: "SALE",
        txHash: tx_hash,
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error updating after buy:", error);
    return new Response(JSON.stringify({ error: "Update failed" }), {
      status: 500,
    });
  }
}

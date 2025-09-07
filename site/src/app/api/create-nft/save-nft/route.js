// src/app/api/create-nft/save-nft/route.js
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const {
      tokenId: token_id,
      name,
      description,
      imageUrl: image_url,
      metadataUrl: metadata_url,
      width,
      height,
      size,
      price,
      category,
      address: wallet_address,
    } = await request.json();

    if (
      !token_id ||
      !name ||
      !description ||
      !image_url ||
      !metadata_url ||
      !price ||
      !wallet_address
    ) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const user_record = await prisma.user.upsert({
      where: { walletAddress: wallet_address },
      update: {},
      create: { walletAddress: wallet_address },
    });

    const nft_record = await prisma.nFT.create({
      data: {
        tokenId: token_id,
        name,
        description,
        imageUrl: image_url,
        metadata: metadata_url,
        width,
        height,
        size,
        ownerId: "ContractId",
      },
    });

    const listing_record = await prisma.listing.create({
      data: {
        tokenId: token_id,
        price,
        category: category || undefined,
        sellerId: user_record.id,
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error saving NFT to database:", error);
    return new Response(JSON.stringify({ error: "Save failed" }), {
      status: 500,
    });
  }
}

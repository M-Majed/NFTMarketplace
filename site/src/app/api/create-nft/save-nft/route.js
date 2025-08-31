// src/app/api/create-nft/save-nft/route.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function POST(request) {
  try {
    const {
      tokenId,
      name,
      description,
      imageUrl,
      metadataUrl,
      width,
      height,
      size,
      price,
      category,
      address,
      txHash,
      imageHash,
      metadataHash,
    } = await request.json();

    if (
      !tokenId ||
      !name ||
      !description ||
      !imageUrl ||
      !metadataUrl ||
      !price ||
      !address
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // seller (EOA)
      const seller = await tx.user.upsert({
        where: { walletAddress: address },
        update: {},
        create: { walletAddress: address },
      });

      // marketplace contract (escrow owner while listed)
      const marketplace = await tx.user.upsert({
        where: { walletAddress: process.env.NEXT_NFT_MARKETPLACE_ADDRESS
 },
        update: {},
        create: { walletAddress: process.env.NEXT_NFT_MARKETPLACE_ADDRESS
 },
      });

      // NFT row (idempotent)
      await tx.nFT.upsert({
        where: { tokenId },
        update: {
          name,
          description,
          imageUrl,
          metadata: metadataUrl,
          width,
          height,
          size,
          ownerId: "ContractId" // matches on-chain owner during listing
        },
        create: {
          tokenId,
          name,
          description,
          imageUrl,
          metadata: metadataUrl,
          width,
          height,
          size,
          ownerId: "ContractId",
        },
      });

      // Listing row (idempotent)
      await tx.listing.upsert({
        where: { tokenId },
        update: {
          price: String(price),
          category: category || undefined,
          sellerId: seller.id,
        },
        create: {
          tokenId,
          price: String(price),
          category: category || undefined,
          sellerId: seller.id,
        },
      });

      return { ok: true };
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error saving NFT to database:", error);
    return new Response(JSON.stringify({ error: "Save failed" }), {
      status: 500,
    });
  }
}

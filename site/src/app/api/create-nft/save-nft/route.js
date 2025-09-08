// src/app/api/create-nft/save-nft/route.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const runtime = "nodejs";

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
      address
    } = await request.json();

    if (!tokenId || !name || !description || !imageUrl || !metadataUrl || !price || !address) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { walletAddress: address },
      update: {},
      create: { walletAddress: address },
    });

    const nft = await prisma.nFT.create({
      data: {
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

    const listing = await prisma.listing.create({
      data: {
        tokenId,
        price,
        category: category || undefined,
        sellerId: user.id,
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error saving NFT to database:', error);
    return new Response(JSON.stringify({ error: 'Save failed' }), { status: 500 });
  }
}
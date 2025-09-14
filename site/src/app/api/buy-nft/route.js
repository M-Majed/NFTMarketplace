import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs";
const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { tokenId, buyerAddress, price, txHash } = await request.json();

    //* Basic validation
    if (!tokenId || !buyerAddress || !price) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    //* Fetch the listing
    const listing = await prisma.listing.findUnique({
      where: { tokenId },
      include: { seller: true },
    });
    //* Ensure the listing exists and is active
    if (!listing || !listing.active) {
      return new Response(
        JSON.stringify({ error: "Active listing not found" }),
        { status: 400 }
      );
    }

    //* prevent self-purchase
    if (
      listing?.seller?.walletAddress &&
      buyerAddress &&
      listing.seller.walletAddress.toLowerCase() === buyerAddress.toLowerCase()
    ) {
      return new Response(
        JSON.stringify({ error: "You cannot buy your own listing." }),
        { status: 400 }
      );
    }

    //* add buyer if not exists
    const buyer = await prisma.user.upsert({
      where: { walletAddress: buyerAddress },
      update: {},
      create: { walletAddress: buyerAddress },
    });

    //* Update NFT ownership, deactivate listing, and record transaction
    await prisma.nFT.update({
      where: { tokenId },
      data: { ownerId: buyer.id },
    });
    await prisma.listing.update({
      where: { tokenId },
      data: { active: false },
    });
    await prisma.transaction.create({
      data: {
        tokenId,
        listingId: listing.id,
        buyerId: buyer.id,
        sellerId: listing.sellerId,
        price,
        type: "SALE",
        txHash,
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

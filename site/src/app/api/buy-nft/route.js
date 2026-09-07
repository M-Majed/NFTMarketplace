import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs";
const prisma = new PrismaClient();
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  try {
    const { tokenId, price, txHash } = await request.json();
    const session = await getServerSession(authOptions);
    if (!session?.user?.address) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const buyerAddress = session.user.address.toLowerCase();
    // Basic validation
    if (!tokenId || !price) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Fetch the listing
    const listing = await prisma.listing.findUnique({
      where: { tokenId },
      include: { seller: true },
    });
    // Ensure the listing exists and is active
    if (!listing || !listing.active) {
      return new Response(
        JSON.stringify({ error: "Active listing not found" }),
        { status: 400 }
      );
    }

    // Prevent self-purchase
    if (
      listing?.seller?.walletAddress &&
      listing.seller.walletAddress.toLowerCase() === buyerAddress.toLowerCase()
    ) {
      return new Response(
        JSON.stringify({ error: "You cannot buy your own listing." }),
        { status: 400 }
      );
    }

    // Transaction hash already exists
    if (txHash) {
      const existing = await prisma.transaction.findFirst({ where: { txHash } });
      if (existing) {
        return new Response(JSON.stringify({ success: true, already: true }), { status: 200 });
      }
    }

    await prisma.$transaction(async (tx) => {

      // Ensure buyer exists
      const buyer = await tx.user.upsert({
        where: { walletAddress: buyerAddress },
        update: {},
        create: { walletAddress: buyerAddress },
      });

      // Update nft owner
      await tx.nFT.update({
        where: { tokenId },
        data: { ownerId: buyer.id },
      });

      // Deactivate listing
      await tx.listing.update({
        where: { tokenId },
       data: { active: false },
      });

      // Add transaction to db
      await tx.transaction.create({
        data: {
          tokenId,
          listingId: listing.id,
          buyerId: buyer.id,
          sellerId: listing.sellerId,
          price: String(price),
          type: "SALE",
          txHash,
        },
      });
    });


    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Error updating after buy:", error);
    return new Response(JSON.stringify({ error: "Update failed" }), {
      status: 500,
    });
  }
}

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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
      txHash,
    } = await request.json();

    //* Auth + Validation
    const session = await getServerSession(authOptions);
    if (!session?.user?.address) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }
    const sellerAddr = session.user.address.toLowerCase();
    if (
      !tokenId ||
      !name ||
      !description ||
      !imageUrl ||
      !metadataUrl ||
      !price
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }
    if (isNaN(price) || price <= 0) {
      return new Response(JSON.stringify({ error: "Invalid price" }), {
        status: 400,
      });
    }

    //* get marketplace address
    const marketAddrRaw = process.env.NEXT_NFT_MARKETPLACE_ADDRESS;
    const marketAddr = marketAddrRaw.toLowerCase();


    //* listing already exists
    const existing = await prisma.listing.findUnique({ where: { tokenId } });
    if (existing) {
      return new Response(JSON.stringify({ success: true, already: true }), { status: 200 });
    }

    await prisma.$transaction(async (tx) => {

      //* Ensure seller exists
      const seller = await tx.user.upsert({
        where: { walletAddress: sellerAddr },
        update: {},
        create: { walletAddress: sellerAddr },
        select: { id: true },
      });

      //* Ensure marketplace “owner” exists
      const contractUser = await tx.user.upsert({
        where: { walletAddress: marketAddr },
        create: { walletAddress: marketAddr },
        update: {},
        select: { id: true },
      });

      //* Create NFT if not present
      await tx.nFT.upsert({
        where: { tokenId },
        update: {},
        create: {
          tokenId,
          name,
          description,
          imageUrl,
          metadata: metadataUrl,
          width,
          height,
          size,
          ownerId: contractUser.id,
          txHash,
        },
      });

      //* Create listing– duplicate => handled before
      await tx.listing.create({
        data: {
          tokenId,
          price,
          category: category || undefined,
          sellerId: seller.id,
        },
      });
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("Error saving NFT to database:", error);
    return new Response(JSON.stringify({ error: "Save failed" }), {
      status: 500,
    });
  }
}

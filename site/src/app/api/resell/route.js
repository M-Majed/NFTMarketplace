import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
export const runtime = "nodejs";
const prisma = new PrismaClient();
import { categories } from "@/app/constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const { tokenId, price, txHash, category } = await req.json();
    const session = await getServerSession(authOptions);
    if (!session?.user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionAddress = session.user.address.toLowerCase();

    //* Validation
    const ALLOWED = categories.map((c) => c.category);
    if (category !== undefined && category !== null) {
      if (typeof category !== "string" || !ALLOWED.includes(category)) {
        return NextResponse.json(
          { error: "Invalid category" },
          { status: 400 }
        );
      }
    }
    if (
      tokenId === undefined ||
      tokenId === null ||
      isNaN(Number(tokenId)) ||
      Number(tokenId) <= 0
    ) {
      return NextResponse.json({ error: "Invalid tokenId" }, { status: 400 });
    }
    if (!price || !/^\d+(\.\d+)?$/.test(String(price))) {
      //* simple regex for decimal numbers
      return NextResponse.json(
        { error: "Invalid price (expected stringified ETH amount)" },
        { status: 400 }
      );
    }

    const tokenIdInt = Number(tokenId);

    //* Fetch NFT + owner from DB
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

    //* Ensure requester owns the NFT
    if (nft.owner.walletAddress.toLowerCase() !== sessionAddress) {
      return NextResponse.json(
        { error: "This wallet does not own the NFT in DB." },
        { status: 403 }
      );
    }
    const seller = nft.owner;

    //* get marketplace address
    const marketAddrRaw = process.env.NEXT_NFT_MARKETPLACE_ADDRESS;
    if (!marketAddrRaw || typeof marketAddrRaw !== "string") {
      return NextResponse.json(
        {
          error:
            "Marketplace (contract) address missing. Pass `marketplaceAddress` in body or set an env var.",
        },
        { status: 500 }
      );
    }
    const marketAddr = marketAddrRaw.toLowerCase();

    //* ensure marketplace address is in DB
    const contractUser = await prisma.user.upsert({
      where: { walletAddress: marketAddr },
      create: { walletAddress: marketAddr },
      update: {},
    });

    //* Idempotency: if already listed (owner already contract + same seller/price/category), return success
    const existing = await prisma.listing.findUnique({
      where: { tokenId: tokenIdInt },
      include: { nft: true },
    });
    if (
      existing &&
      existing.active === true &&
      existing.sellerId === seller.id &&
      String(existing.price) === String(price) &&
      (!category || existing.category === category) &&
      nft.ownerId === contractUser.id
    ) {
      return NextResponse.json(
        { ok: true, already: true, listing: existing, txHash: txHash || null },
        { status: 200 }
      );
    }

    //* set NFT owner to contract + add or update listing
    const [updatedNFT, listing] = await prisma.$transaction([
      prisma.nFT.update({
        where: { tokenId: tokenIdInt },
        data: { ownerId: contractUser.id },
        select: { tokenId: true, ownerId: true },
      }),
      prisma.listing.upsert({
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
          ...(category ? { category } : {}),
        },
        include: { nft: true, seller: true },
      }),
    ]);

    return NextResponse.json(
      {
        ok: true,
        listing,
        nft: updatedNFT,
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

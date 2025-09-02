// src/app/api/wishlist/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");
    const walletAddress = searchParams.get("walletAddress");
    if (!listingId || !walletAddress) {
      return NextResponse.json(
        { error: "listingId and walletAddress are required" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ inWishlist: false });

    const existing = await prisma.wishlistItem.findFirst({
      where: { userId: user.id, listingId },
      select: { id: true },
    });
    return NextResponse.json({ inWishlist: !!existing });
  } catch (err) {
    console.error("wishlist:GET error", err);
    const body =
      process.env.NODE_ENV !== "production"
        ? { error: err.message || "Internal Server Error" }
        : { error: "Internal Server Error" };
    return NextResponse.json(body, { status: 500 });
  }
}



const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export async function POST(req) {
  try {
    const { listingId, walletAddress } = await req.json();

    if (!listingId || !walletAddress) {
      return NextResponse.json(
        { error: "listingId and walletAddress are required" },
        { status: 400 }
      );
    }

    // Enforce: only allow active listings to be wishlisted
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, active: true },
    });

    if (!listing || !listing.active) {
      return NextResponse.json(
        { error: "Listing is not active or not found" },
        { status: 400 }
      );
    }

    // Ensure user exists (by wallet)
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: { walletAddress },
      select: { id: true },
    });

    // Upsert to avoid duplicates (relies on @@unique([userId, listingId]))
    const wishlistItem = await prisma.wishlistItem.upsert({
      where: {
        userId_listingId: { userId: user.id, listingId },
      },
      update: {},
      create: { userId: user.id, listingId },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: wishlistItem.id });
  } catch (err) {
    console.error("wishlist:POST error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { listingId, walletAddress } = await req.json();
    if (!listingId || !walletAddress) {
      return NextResponse.json(
        { error: "listingId and walletAddress are required" },
        { status: 400 }
      );
    }
    const user = await prisma.user.findUnique({
      where: { walletAddress },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ ok: true, removed: false });

    // Use deleteMany to avoid depending on composite key alias
    const result = await prisma.wishlistItem.deleteMany({
      where: { userId: user.id, listingId },
    });
    return NextResponse.json({ ok: true, removed: result.count > 0 });
  } catch (err) {
    console.error("wishlist:DELETE error", err);
    const body =
      process.env.NODE_ENV !== "production"
        ? { error: err.message || "Internal Server Error" }
        : { error: "Internal Server Error" };
    return NextResponse.json(body, { status: 500 });
  }
}
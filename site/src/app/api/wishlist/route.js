// route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export async function GET(request) {
  try {
    const { searchParams: search_params } = new URL(request.url);
    const listing_id = search_params.get("listingId");
    const wallet_address = search_params.get("walletAddress");

    if (!listing_id || !wallet_address) {
      return NextResponse.json(
        { error: "listingId and walletAddress are required" },
        { status: 400 }
      );
    }

    const user_record = await prisma.user.findUnique({
      where: { walletAddress: wallet_address },
      select: { id: true },
    });
    if (!user_record) return NextResponse.json({ inWishlist: false });

    const existing_item = await prisma.wishlistItem.findFirst({
      where: { userId: user_record.id, listingId: listing_id },
      select: { id: true },
    });

    return NextResponse.json({ inWishlist: !!existing_item });
  } catch (err) {
    console.error("wishlist:GET error", err);
    const body =
      process.env.NODE_ENV !== "production"
        ? { error: err.message || "Internal Server Error" }
        : { error: "Internal Server Error" };
    return NextResponse.json(body, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { listingId: listing_id, walletAddress: wallet_address } = await request.json();

    if (!listing_id || !wallet_address) {
      return NextResponse.json(
        { error: "listingId and walletAddress are required" },
        { status: 400 }
      );
    }

    const listing_record = await prisma.listing.findUnique({
      where: { id: listing_id },
      select: { id: true, active: true },
    });

    if (!listing_record || !listing_record.active) {
      return NextResponse.json(
        { error: "Listing is not active or not found" },
        { status: 400 }
      );
    }

    const user_record = await prisma.user.upsert({
      where: { walletAddress: wallet_address },
      update: {},
      create: { walletAddress: wallet_address },
      select: { id: true },
    });

    const wishlist_item = await prisma.wishlistItem.upsert({
      where: {
        userId_listingId: { userId: user_record.id, listingId: listing_id },
      },
      update: {},
      create: { userId: user_record.id, listingId: listing_id },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: wishlist_item.id });
  } catch (err) {
    console.error("wishlist:POST error", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { listingId: listing_id, walletAddress: wallet_address } = await request.json();

    if (!listing_id || !wallet_address) {
      return NextResponse.json(
        { error: "listingId and walletAddress are required" },
        { status: 400 }
      );
    }

    const user_record = await prisma.user.findUnique({
      where: { walletAddress: wallet_address },
      select: { id: true },
    });
    if (!user_record) return NextResponse.json({ ok: true, removed: false });

    const result = await prisma.wishlistItem.deleteMany({
      where: { userId: user_record.id, listingId: listing_id },
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

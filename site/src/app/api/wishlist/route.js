import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
const prisma = new PrismaClient();

//$ Check if in wishlist
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("listingId");
    const session = await getServerSession(authOptions);
    const sessionAddr = session?.user?.address?.toLowerCase?.();
    if (!listingId) {
      return NextResponse.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }
    if (!sessionAddr) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //* check if user exists
    const user = await prisma.user.findUnique({
      where: { walletAddress: sessionAddr },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ inWishlist: false });

    //* Check if wishlist item exists
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

//$ Add to wishlist
export async function POST(req) {
  try {
    const { listingId } = await req.json();
    const session = await getServerSession(authOptions);
    const sessionAddr = session?.user?.address?.toLowerCase?.();
    if (!listingId) {
      return NextResponse.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }
    if (!sessionAddr) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //* Ensure listing exists and is active
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

    //* add user if not exists
    const user = await prisma.user.upsert({
      where: { walletAddress: sessionAddr },
      update: {},
      create: { walletAddress: sessionAddr },
      select: { id: true },
    });

    //* add to wishlist item if not exists
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

//$ Remove from wishlist
export async function DELETE(req) {
  try {
    const { listingId } = await req.json();
    const session = await getServerSession(authOptions);
    const sessionAddr = session?.user?.address?.toLowerCase?.();
    if (!listingId) {
      return NextResponse.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }
    if (!sessionAddr) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //* Ensure user exists
    const user = await prisma.user.findUnique({
      where: { walletAddress: sessionAddr },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ ok: true, removed: false });

    //* Remove wishlist item if exists
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

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export const runtime = "nodejs";
const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    //* Parse and validate query parameters
    const categories = searchParams.getAll("category");
    const search = searchParams.get("search") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPriceRaw = searchParams.get("maxPrice");
    const maxPrice = maxPriceRaw
      ? parseFloat(maxPriceRaw)
      : Number.POSITIVE_INFINITY;

    //* Pagination parameters with defaults and limits
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10)); //* default to page 1, decimal
    const take = Math.max(
      1,
      Math.min(50, parseInt(searchParams.get("take") || "12", 10))
    ); //* how many per page, default 12
    const skip = (page - 1) * take; //* how many to skip based on page

    //* Wishlist mode
    const wishlist = ["1", "true", "yes"].includes(
      (searchParams.get("wishlist") || "").toLowerCase()
    );


    //* base non-price filters
    const whereBase = {
      active: true,
      ...(categories.length ? { category: { in: categories } } : {}), //* filter by categories if provided
      ...(search
        ? {
            OR: [
              { nft: { name: { contains: search } } }, //* search
              { nft: { description: { contains: search } } },
            ],
          }
        : {}),
    };
    let where = whereBase; //* start with base filters - prisma where object

    //* Wishlist-only mode
    if (wishlist) {
      // Require a signed-in session and take the wallet from it.
      const session = await getServerSession(authOptions);
      const sessionAddr = session?.user?.address?.toLowerCase?.();
      if (!sessionAddr) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const user = await prisma.user.findUnique({
        //* find user
        where: { walletAddress: sessionAddr },
        select: { id: true },
      });
      if (!user) {
        //* no user found
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          pageSize: take,
          pages: 0,
        });
      }
      const rows = await prisma.wishlistItem.findMany({
        //* get their wishlist
        where: { userId: user.id },
        select: { listingId: true },
      });
      const listingIds = rows.map((r) => r.listingId); //* extract listing IDs
      if (!listingIds.length) {
        //* empty wishlist
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          pageSize: take,
          pages: 0,
        });
      }
      where = { ...whereBase, id: { in: listingIds } }; //* base + wishlist filters
    }

    //* Fetch listings from DB that match non-price filters
    const rows = await prisma.listing.findMany({
      where, //* apply combined filters
      include: { nft: true, seller: true },
      orderBy: { createdAt: "desc" },
    });

    //* check price filter
    const filtered = rows.filter((l) => {
      const p = parseFloat(l.price);
      if (Number.isNaN(p)) return false;
      if (p < minPrice) return false;
      if (p > maxPrice) return false;
      return true;
    });

    //* Pagination calculations
    const total = filtered.length;
    const pages = Math.ceil(total / take);
    const items = filtered.slice(skip, skip + take);

    return NextResponse.json({ items, total, page, pageSize: take, pages });
  } catch (err) {
    console.error("Marketplace API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

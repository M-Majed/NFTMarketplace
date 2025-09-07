// src/app/api/marketplace/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams: search_params } = new URL(request.url);

    const categories = search_params.getAll("category");
    const search = search_params.get("search") || "";
    const min_price = parseFloat(search_params.get("minPrice") || "0");
    const max_price_raw = search_params.get("maxPrice");
    const max_price = max_price_raw
      ? parseFloat(max_price_raw)
      : Number.POSITIVE_INFINITY;

    const page = Math.max(1, parseInt(search_params.get("page") || "1", 10));
    const page_size = Math.max(
      1,
      Math.min(50, parseInt(search_params.get("take") || "12", 10))
    );
    const skip = (page - 1) * page_size;

    const wishlist = ["1", "true", "yes"].includes(
      (search_params.get("wishlist") || "").toLowerCase()
    );
    const wallet_address = search_params.get("address");

    const where_base = {
      active: true,
      ...(categories.length ? { category: { in: categories } } : {}),
      ...(search
        ? {
            OR: [
              { nft: { name: { contains: search } } },
              { nft: { description: { contains: search } } },
            ],
          }
        : {}),
    };

    let where = where_base;

    if (wishlist) {
      if (!wallet_address) {
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          pageSize: page_size,
          pages: 0,
        });
      }

      const user_record = await prisma.user.findUnique({
        where: { walletAddress: wallet_address },
        select: { id: true },
      });
      if (!user_record) {
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          pageSize: page_size,
          pages: 0,
        });
      }

      const rows = await prisma.wishlistItem.findMany({
        where: { userId: user_record.id },
        select: { listingId: true },
      });
      const listing_ids = rows.map((r) => r.listingId);
      if (!listing_ids.length) {
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          pageSize: page_size,
          pages: 0,
        });
      }

      where = { ...where_base, id: { in: listing_ids } };
    }

    const rows = await prisma.listing.findMany({
      where,
      include: { nft: true, seller: true },
      orderBy: { createdAt: "desc" },
    });

    const filtered = rows.filter((l) => {
      const p = parseFloat(l.price);
      if (Number.isNaN(p)) return false;
      if (p < min_price) return false;
      if (p > max_price) return false;
      return true;
    });

    const total = filtered.length;
    const pages = Math.ceil(total / page_size);
    const items = filtered.slice(skip, skip + page_size);

    return NextResponse.json({
      items,
      total,
      page,
      pageSize: page_size,
      pages,
    });
  } catch (err) {
    console.error("Marketplace API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

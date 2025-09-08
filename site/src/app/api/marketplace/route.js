// src/app/api/fetch-wishlist/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";
const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const categories = searchParams.getAll("category"); // repeatable
    const search = searchParams.get("search") || "";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPriceRaw = searchParams.get("maxPrice");
    const maxPrice = maxPriceRaw ? parseFloat(maxPriceRaw) : Number.POSITIVE_INFINITY;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const take = Math.max(1, Math.min(50, parseInt(searchParams.get("take") || "12", 10)));
    const skip = (page - 1) * take;

    const wishlist = ["1", "true", "yes"].includes(
      (searchParams.get("wishlist") || "").toLowerCase()
    );
    const address = searchParams.get("address"); // client passes connected wallet when wishlist=1

    // base filters (non-price)
    const whereBase = {
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

    let where = whereBase;

    // Wishlist-only mode: restrict to listing IDs saved by this wallet's user
    if (wishlist) {
      if (!address) {
        return NextResponse.json({ items: [], total: 0, page, pageSize: take, pages: 0 });
      }
      const user = await prisma.user.findUnique({
        where: { walletAddress: address },
        select: { id: true },
      });
      if (!user) {
        return NextResponse.json({ items: [], total: 0, page, pageSize: take, pages: 0 });
      }
      const rows = await prisma.wishlistItem.findMany({
        where: { userId: user.id },
        select: { listingId: true },
      });
      const listingIds = rows.map((r) => r.listingId);
      if (!listingIds.length) {
        return NextResponse.json({ items: [], total: 0, page, pageSize: take, pages: 0 });
      }
      where = { ...whereBase, id: { in: listingIds } };
    }

    // Pull rows that match non-price filters; then apply numeric price filter in JS
    const rows = await prisma.listing.findMany({
      where,
      include: { nft: true, seller: true },
      orderBy: { createdAt: "desc" },
    });

    const filtered = rows.filter((l) => {
      const p = parseFloat(l.price);
      if (Number.isNaN(p)) return false;
      if (p < minPrice) return false;
      if (p > maxPrice) return false;
      return true;
    });

    const total = filtered.length;
    const pages = Math.ceil(total / take);
    const items = filtered.slice(skip, skip + take);

    return NextResponse.json({ items, total, page, pageSize: take, pages });
  } catch (err) {
    console.error("Marketplace API error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

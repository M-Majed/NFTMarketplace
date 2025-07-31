// src/app/marketplace/page.jsx
import React from "react";
import Link from "next/link";
import NFTCard from "./NFTCard/NFTCard";
import { prisma } from "@/lib/prisma";
import Style from "./page.module.css";

export default async function MarketplacePage({ searchParams }) {
  const {
    category: catParam,
    search,
    minPrice,
    maxPrice,
    page: pageParam,
  } = searchParams;

  // parse page number, default to 1
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  const take = 12;
  const skip = (currentPage - 1) * take;

  const categories = catParam
    ? Array.isArray(catParam)
      ? catParam
      : [catParam]
    : [];
  const where = {
    active: true,
    ...(categories.length > 0 ? { category: { in: categories } } : {}),
    ...(search
      ? {
          OR: [
            { nft: { name: { contains: search } } },
            { nft: { description: { contains: search } } },
          ],
        }
      : {}),
  };

  // fetch all matching non-price filters, sorted by createdAt desc (newest first)
  const allListings = await prisma.listing.findMany({
    where,
    include: { nft: true, seller: true },
    orderBy: { createdAt: 'desc' },
  });

  // parse min/max, default min to 0, max to Infinity
  const min = minPrice ? parseFloat(minPrice) : 0;
  const max = maxPrice ? parseFloat(maxPrice) : Infinity;

  // filter numerically on price
  const filtered = allListings.filter(l => {
    const p = parseFloat(l.price);
    return !isNaN(p) && p >= min && p <= max;
  });

  const totalCount = filtered.length;
  const listings = filtered.slice(skip, skip + take);

  const totalPages = Math.ceil(totalCount / take);

  // helper to rebuild the querystring with a new page
  const buildHref = (page) => {
    const params = new URLSearchParams();
    categories.forEach((cat) => params.append("category", cat));
    if (search) params.set("search", search);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    params.set("page", String(page));
    return `/marketplace?${params.toString()}`;
  };
  return (
    <div>
      <NFTCard items={listings} />

      {/* pagination controls */}
      <nav className={Style.pagination}>
        {currentPage > 1 && (
          <Link href={buildHref(currentPage - 1)}>← Prev</Link>
        )}{" "}
        {Array.from({ length: totalPages }, (_, i) => {
          const pageNum = i + 1;
          return (
            <Link
              key={pageNum}
              href={buildHref(pageNum)}
              className={`${Style.pageLink} ${
                pageNum === currentPage ? Style.activePage : ""
              }`}>
              {pageNum}
            </Link>
          );
        })}{" "}
        {currentPage < totalPages && (
          <Link href={buildHref(currentPage + 1)}>Next →</Link>
        )}
      </nav>
    </div>
  );
}
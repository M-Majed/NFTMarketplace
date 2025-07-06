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

  // build your existing filters
  const categories = catParam
    ? Array.isArray(catParam)
      ? catParam
      : [catParam]
    : [];

  const priceFilter = {};
  if (minPrice) priceFilter.gte = parseFloat(minPrice);
  if (maxPrice) priceFilter.lte = parseFloat(maxPrice);

  const where = {
    status: "ACTIVE",
    ...(categories.length > 0
      ? { nft: { category: { in: categories } } }
      : {}),
    ...(Object.keys(priceFilter).length > 0
      ? { price: priceFilter }
      : {}),
    ...(search
      ? {
          OR: [
            { nft: { title:       { contains: search } } },
            { nft: { description: { contains: search } } },
          ],
        }
      : {}),
  };

  // get total count for pagination
  const totalCount = await prisma.listing.count({ where });

  // fetch only the slice we need
  const listings = await prisma.listing.findMany({
    where,
    include: { nft: true, seller: true },
    skip,
    take,
  });

  const totalPages = Math.ceil(totalCount / take);

  // helper to rebuild the querystring with a new page
  const buildHref = (page) => {
    const params = new URLSearchParams();
    categories.forEach(cat => params.append("category", cat));
    if (search)   params.set("search", search);
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
              className={`${Style.pageLink} ${pageNum === currentPage ? Style.activePage : ""}`}
            >
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

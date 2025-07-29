// src/app/marketplace/page.jsx
"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import NFTCard from "./NFTCard/NFTCard";
import { prisma } from "@/lib/prisma";
import Style from "./page.module.css";

import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";

export default function MarketplacePage({ searchParams }) {
  // const {
  //   category: catParam,
  //   search,
  //   minPrice,
  //   maxPrice,
  //   page: pageParam,
  // } = searchParams;

  // // parse page number, default to 1
  // const currentPage = pageParam ? parseInt(pageParam, 10) : 1;
  // const take = 12;
  // const skip = (currentPage - 1) * take;

  // const categories = catParam
  //   ? Array.isArray(catParam)
  //     ? catParam
  //     : [catParam]
  //   : [];
  // const priceFilter = {};
  // if (minPrice) priceFilter.gte = parseFloat(minPrice);
  // if (maxPrice) priceFilter.lte = parseFloat(maxPrice);
  // const where = {
  //   status: "ACTIVE",
  //   ...(categories.length > 0
  //     ? { nft: { category: { in: categories } } }
  //     : {}),
  //   ...(Object.keys(priceFilter).length > 0
  //     ? { price: priceFilter }
  //     : {}),
  //   ...(search
  //     ? {
  //         OR: [
  //           { nft: { title:       { contains: search } } },
  //           { nft: { description: { contains: search } } },
  //         ],
  //       }
  //     : {}),
  // };

  // // helper to rebuild the querystring with a new page
  // const buildHref = (page) => {
  //   const params = new URLSearchParams();
  //   categories.forEach(cat => params.append("category", cat));
  //   if (search)   params.set("search", search);
  //   if (minPrice) params.set("minPrice", minPrice);
  //   if (maxPrice) params.set("maxPrice", maxPrice);
  //   params.set("page", String(page));
  //   return `/marketplace?${params.toString()}`;
  // };




    const {fetchNFTs} = useContext(NFTMarketplaceContext);
    const [nfts, setNfts] = useState([]);
    const [nftscCopy, setNftscopy] = useState([]);
    
      useEffect(() => {
        (async () => {
          try {
            const items = await fetchNFTs();
            setNfts(items.reverse());
            setNftscopy(items);
            console.log("fetched items:", items);
          } catch (err) {
            console.error("❌ fetchNFTs threw:", err);
          }
        })();
      }, [fetchNFTs]);

  return (
    <div>
      <NFTCard items={nfts} />

      {/* pagination controls
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
      </nav> */}
    </div>
  );
}
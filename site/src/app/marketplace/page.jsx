"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";
import NFTCard from "./NFTCard/NFTCard";
import Style from "./page.module.css";

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount(); // User address from wagmi
  const [items, setItems] = useState([]); // Fetched items
  const [page, setPage] = useState(Number(searchParams.get("page") || "1")); // Current page
  const [pages, setPages] = useState(1); // Total pages
  const [loading, setLoading] = useState(true); // Loading state

  // Gets url query(filters, wishlist, page) and builds api query string for fetching items
  const buildApiQS = () => {
    const params = new URLSearchParams(searchParams.toString()); // Copy search params
    return params.toString();
  };

  // Fetch items when search params, address or connection status changes
  useEffect(() => {
    let alive = true; // To prevent state updates if component unmounts(e.g., user navigates away)
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/fetch-market-items?${buildApiQS()}`, {
          cache: "no-store",
        }); // Fetch items from api
        const data = await res.json();
        if (!alive) return;
        setItems(data.items || []);
        setPage(data.page || 1);
        setPages(data.pages || 1);
      } catch (e) {
        console.error(e);
        if (alive) {
          setItems([]);
          setPage(1);
          setPages(1);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [searchParams, address, isConnected]); // Run again if any of these change

  // Build href for pagination links, keeping current search params
  const buildHref = (n) => {
    const params = new URLSearchParams(searchParams.toString()); // Copy current search params
    params.set("page", String(n)); // Add page param
    return `/marketplace?${params.toString()}`; // Return full href
  };

  // Wishlist requested but user not connected
  if (searchParams.get("wishlist") && !isConnected) {
    return (
      <p className={Style.marketplace}>
        Please connect your wallet to view your wishlist.
      </p>
    );
  }

  return (
    <div className={Style.marketplace}>
      {loading ? <p>Loading…</p> : <NFTCard items={items} />}
      <nav className={Style.pagination}>
        {page > 1 && <Link href={buildHref(page - 1)}>← Prev</Link>}
        {Array.from({ length: pages }, (_, i) => {
          const n = i + 1;
          return (
            <Link
              key={n}
              href={buildHref(n)}
              className={`${Style.pageLink} ${
                n === page ? Style.activePage : ""
              }`}>
              {n}
            </Link>
          );
        })}
        {page < pages && <Link href={buildHref(page + 1)}>Next →</Link>}
      </nav>
    </div>
  );
}

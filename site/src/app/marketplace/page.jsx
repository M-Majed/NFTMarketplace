"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";
import NFTCard from "./NFTCard/NFTCard";
import Style from "./page.module.css";

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(Number(searchParams.get("page") || "1"));
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const buildApiQS = () => {
    const params = new URLSearchParams(searchParams.toString());
    const wishlist = params.get("wishlist");
    if (wishlist && isConnected && address) params.set("address", address);
    else params.delete("address");
    return params.toString();
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/marketplace?${buildApiQS()}`, { cache: "no-store" });
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
    return () => { alive = false; };
  }, [searchParams, address, isConnected]);

  const buildHref = (n) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(n));
    return `/marketplace?${params.toString()}`;
  };

  if (searchParams.get("wishlist") && !isConnected) {
    return <p className={Style.marketplace}>Please connect your wallet to view your wishlist.</p>;
  }

  return (
    <div className={Style.marketplace}>
      {loading ? <p>Loading…</p> : <NFTCard items={items} />}
      <nav className={Style.pagination}>
        {page > 1 && <Link href={buildHref(page - 1)}>← Prev</Link>}
        {Array.from({ length: pages }, (_, i) => {
          const n = i + 1;
          return (
            <Link key={n} href={buildHref(n)} className={`${Style.pageLink} ${n === page ? Style.activePage : ""}`}>
              {n}
            </Link>
          );
        })}
        {page < pages && <Link href={buildHref(page + 1)}>Next →</Link>}
      </nav>
    </div>
  );
}

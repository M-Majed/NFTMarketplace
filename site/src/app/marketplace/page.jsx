// src/app/marketplace/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import Link from "next/link";
import NFTCard from "./NFTCard/NFTCard";
import style from "./page.module.css";

export default function MarketplacePage() {
  const search_params = useSearchParams();
  const { address, isConnected: is_connected } = useAccount();

  const [items, set_items] = useState([]);
  const [page, set_page] = useState(Number(search_params.get("page") || "1"));
  const [pages, set_pages] = useState(1);
  const [loading, set_loading] = useState(true);

  const build_api_qs = () => {
    const params = new URLSearchParams(search_params.toString());
    const wishlist = params.get("wishlist");
    if (wishlist && is_connected && address) params.set("address", address);
    else params.delete("address");
    return params.toString();
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      set_loading(true);
      try {
        const res = await fetch(`/api/marketplace?${build_api_qs()}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!alive) return;
        set_items(data.items || []);
        set_page(data.page || 1);
        set_pages(data.pages || 1);
      } catch (e) {
        if (alive) {
          set_items([]);
          set_page(1);
          set_pages(1);
        }
      } finally {
        if (alive) set_loading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [search_params, address, is_connected]);

  const build_href = (n) => {
    const params = new URLSearchParams(search_params.toString());
    params.set("page", String(n));
    return `/marketplace?${params.toString()}`;
  };

  if (search_params.get("wishlist") && !is_connected) {
    return (
      <p className={style.marketplace}>
        Please connect your wallet to view your wishlist.
      </p>
    );
  }

  return (
    <div className={style.marketplace}>
      {loading ? <p>Loading…</p> : <NFTCard items={items} />}
      <nav className={style.pagination}>
        {page > 1 && <Link href={build_href(page - 1)}>← Prev</Link>}
        {Array.from({ length: pages }, (_, i) => {
          const n = i + 1;
          return (
            <Link
              key={n}
              href={build_href(n)}
              className={`${style.pageLink} ${
                n === page ? style.activePage : ""
              }`}>
              {n}
            </Link>
          );
        })}
        {page < pages && <Link href={build_href(page + 1)}>Next →</Link>}
      </nav>
    </div>
  );
}

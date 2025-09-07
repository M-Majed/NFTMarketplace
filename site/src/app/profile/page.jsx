// src/app/profile/page.jsx
"use client";

import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { useAccount } from "wagmi";
import { formatEther } from "viem";

import style from "./page.module.css";
import img from "@/lib/img";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";

const Profile = () => {
  const [active_tab, set_active_tab] = useState("MyNFTs");
  const { address, isConnected: is_connected } = useAccount();

  const [profile_data, set_profile_data] = useState({
    nfts: [],
    listings: [],
    transactions: [],
  });

  const {
    cancelListing: cancel_listing,
    fetchMyNFTsOrListedNFTs: fetch_mynfts_or_listednfts,
    resellNFT: resell_nft,
    getPendingBalance: get_pending_balance,
    withdraw: withdraw_funds,
  } = useContext(NFTMarketplaceContext);

  const [chain_nfts, set_chain_nfts] = useState([]);
  const [loading_chain, set_loading_chain] = useState(false);
  const [cancelling_id, set_cancelling_id] = useState(null);
  const [reselling_id, set_reselling_id] = useState(null);

  const [show_price_modal, set_show_price_modal] = useState(false);
  const [price_input, set_price_input] = useState("");
  const [selected_nft, set_selected_nft] = useState(null);
  const [selected_category, set_selected_category] = useState("Art");

  const CATEGORY_OPTIONS = [
    "Art",
    "Game",
    "Nature",
    "Sport",
    "Portrait",
    "Animal",
  ];

  const [tx_page, set_tx_page] = useState(1);
  const [tx_page_size, set_tx_page_size] = useState(10);

  const [pending_wei, set_pending_wei] = useState(0n);
  const [loading_pending, set_loading_pending] = useState(false);
  const [withdrawing, set_withdrawing] = useState(false);

  const refresh_pending = async () => {
    if (!is_connected) return;
    try {
      set_loading_pending(true);
      const wei = await get_pending_balance(address);
      set_pending_wei(wei ?? 0n);
    } catch (e) {
      console.warn("getPendingBalance failed:", e);
    } finally {
      set_loading_pending(false);
    }
  };

  useEffect(() => {
    refresh_pending();
  }, [address, is_connected]);

  useEffect(() => {
    const total_pages = Math.max(
      1,
      Math.ceil((profile_data.transactions?.length || 0) / tx_page_size)
    );
    if (tx_page > total_pages) set_tx_page(total_pages);
  }, [profile_data.transactions, tx_page, tx_page_size]);

  const open_resell_dialog = (nft, e) => {
    e?.stopPropagation?.();
    set_selected_nft(nft);
    set_price_input("");
    set_selected_category("Art");
    set_show_price_modal(true);
  };

  const close_resell_dialog = () => {
    if (reselling_id) return;
    set_show_price_modal(false);
    set_selected_nft(null);
    set_price_input("");
  };

  const confirm_resell = async () => {
    if (!selected_nft) return;
    const price = String(price_input).trim();
    if (!/^\d+(\.\d+)?$/.test(price) || Number(price) <= 0) {
      alert("Enter a valid positive number (ETH).");
      return;
    }
    try {
      set_reselling_id(selected_nft.tokenId);
      await resell_nft({
        tokenId: selected_nft.tokenId,
        priceEth: price,
        category: selected_category,
      });
      const res = await fetch(`/api/profile?address=${address}`);
      const data = await res.json();
      set_profile_data(data);
      const updated = await fetch_mynfts_or_listednfts("MyNFTs");
      set_chain_nfts(updated || []);
      close_resell_dialog();
    } catch (err) {
      console.error("Resell failed:", err);
      alert(
        "Resell failed: " +
          (err?.shortMessage || err?.message || "Unknown error")
      );
    } finally {
      set_reselling_id(null);
    }
  };

  useEffect(() => {
    if (!is_connected) return;
    fetch(`/api/profile?address=${address}`)
      .then((res) => res.json())
      .then((data) => set_profile_data(data));
  }, [address, is_connected]);

  useEffect(() => {
    if (!is_connected || active_tab !== "MyNFTs") return;
    let alive = true;
    set_loading_chain(true);
    fetch_mynfts_or_listednfts("MyNFTs")
      .then((items) => {
        if (alive) set_chain_nfts(items || []);
      })
      .catch(console.error)
      .finally(() => {
        if (alive) set_loading_chain(false);
      });
    return () => {
      alive = false;
    };
  }, [is_connected, address, active_tab, fetch_mynfts_or_listednfts]);

  const handle_cancel = async (listing, e) => {
    e?.stopPropagation?.();
    try {
      set_cancelling_id(listing.id);
      await cancel_listing({ tokenId: listing.tokenId, price: listing.price });
      const res = await fetch(`/api/profile?address=${address}`);
      const data = await res.json();
      set_profile_data(data);
    } catch (err) {
      console.error("Cancel failed:", err);
      alert(
        "Cancel failed: " +
          (err?.shortMessage || err?.message || "Unknown error")
      );
    } finally {
      refresh_pending();
    }
  };

  const handle_withdraw_all = async () => {
    const eth = Number(formatEther(pending_wei));
    if (!eth || eth <= 0) return;
    try {
      set_withdrawing(true);
      await withdraw_funds({ amountEth: eth });
      await refresh_pending();
      alert("Withdraw successful.");
    } catch (err) {
      console.error("Withdraw failed:", err);
      alert(
        "Withdraw failed: " +
          (err?.shortMessage || err?.message || "Unknown error")
      );
    } finally {
      set_withdrawing(false);
    }
  };

  if (!is_connected) {
    return <p>Please connect your wallet to view your profile.</p>;
  }

  return (
    <div className={style.Profile}>
      <div className={style.Profile_header}>
        <div className={style.Profile_header_avatar}>
          <Image
            src={img.user1}
            className={style.Profile_header_avatar_img}
            alt="NFT image"
            width={70}
            height={70}
            sizes="(max-width: 600px) 56px, 70px"
          />
        </div>
        <div className={style.Profile_info}>
          <h2>{address}</h2>
          <div className={style.Profile_info_wallet}>
            <p>Wallet Address: {address}</p>
            <div className={style.Profile_info_actions}>
              <span>
                Balance:&nbsp;
                {loading_pending
                  ? "…"
                  : `${Number(formatEther(pending_wei)).toFixed(4)} ETH`}
              </span>
              <button
                className={`${style.Button} ${style.ButtonPrimary}`}
                onClick={handle_withdraw_all}
                disabled={withdrawing || pending_wei === 0n}
                title={
                  pending_wei === 0n
                    ? "No earnings to withdraw"
                    : "Withdraw all earnings"
                }>
                {withdrawing ? "Withdrawing…" : "Withdraw"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={style.Profile_summery}>
        <div className={style.Profile_summery_card}>
          <h2>{profile_data.nfts.length}</h2>
          <p>Owned NFTs</p>
        </div>
        <div className={style.Profile_summery_card}>
          <h2>{profile_data.listings.length}</h2>
          <p>Active Listings</p>
        </div>
        <div className={style.Profile_summery_card}>
          <h2>
            $
            {profile_data.listings
              .reduce((sum, listing) => sum + parseFloat(listing.price), 0)
              .toFixed(2)}
          </h2>
          <p>Portfolio Value</p>
        </div>
      </div>

      <div className={style.Profile_tabs}>
        <button
          className={style.Profile_tabs_btn}
          onClick={() => set_active_tab("MyNFTs")}>
          My NFTs
        </button>
        <button
          className={style.Profile_tabs_btn}
          onClick={() => set_active_tab("ActiveListings")}>
          Active Listings
        </button>
        <button
          className={style.Profile_tabs_btn}
          onClick={() => set_active_tab("TransactionHistory")}>
          Transaction history
        </button>
      </div>

      {active_tab == "MyNFTs" && (
        <div className={style.Profile_MyNFTs}>
          <h2>Owned NFTs</h2>
          {loading_chain ? (
            <p>Loading your on-chain NFTs…</p>
          ) : chain_nfts.length > 0 ? (
            <div className={style.Profile_MyNFTs_NFTGrid}>
              {chain_nfts.map((nft) => (
                <div
                  key={nft.tokenId}
                  className={`${style.Profile_MyNFTs_NFTGrid_card} ${
                    reselling_id === nft.tokenId ? style.isBusy : ""
                  }`}
                  onClick={(e) =>
                    reselling_id ? null : open_resell_dialog(nft, e)
                  }
                  title={
                    reselling_id === nft.tokenId
                      ? "Listing…"
                      : "Click to list this NFT"
                  }>
                  <Image
                    src={nft.image}
                    width={200}
                    height={200}
                    alt={nft.name || `Token #${nft.tokenId}`}
                    className={style.Profile_MyNFTs_NFTGrid_card_img}
                    sizes="(max-width: 600px) 45vw, 200px"
                  />
                  <div className={style.Profile_MyNFTs_NFTGrid_card_info}>
                    <h3>{nft.name || `Token #${nft.tokenId}`}</h3>
                    <small>
                      {reselling_id === nft.tokenId
                        ? "Listing…"
                        : "Click to list for sale"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No NFTs owned yet (on-chain).</p>
          )}
        </div>
      )}

      {active_tab === "ActiveListings" && (
        <div className={style.Profile_MyNFTs}>
          <h2>Active Listings</h2>
          {profile_data.listings.length > 0 ? (
            <div className={style.Profile_MyNFTs_list}>
              {profile_data.listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/nftdetails/${listing.tokenId}`}
                  className={style.Profile_MyNFTs_list_item}>
                  {listing.nft.name} - Price: {listing.price} ETH
                  <div className={style.Profile_MyNFTs_list_item_btns}>
                    <MdDeleteForever
                      className={`${style.Profile_MyNFTs_list_item_btns_btn} ${
                        cancelling_id === listing.id ? style.isBusyIcon : ""
                      }`}
                      title={
                        cancelling_id === listing.id
                          ? "Cancelling..."
                          : "Cancel listing"
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handle_cancel(listing, e);
                      }}
                    />
                    <MdEdit
                      className={style.Profile_MyNFTs_list_item_btns_btn}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p>No active listings.</p>
          )}
        </div>
      )}

      {active_tab == "TransactionHistory" && (
        <div className={style.Profile_MyNFTs}>
          <h2>Transaction History</h2>
          {profile_data.transactions.length > 0 ? (
            (() => {
              const start = (tx_page - 1) * tx_page_size;
              const end = start + tx_page_size;
              const paginated = profile_data.transactions.slice(start, end);
              const total_pages = Math.max(
                1,
                Math.ceil(profile_data.transactions.length / tx_page_size)
              );

              return (
                <>
                  <div className={style.Profile_TransactionHistory_list}>
                    {paginated.map((tx) => {
                      const is_seller = tx.seller.walletAddress === address;
                      return (
                        <div
                          key={tx.id}
                          className={
                            style.Profile_TransactionHistory_list_item
                          }>
                          {is_seller ? "Sold" : "Bought"} {tx.nft.name} - Price:{" "}
                          {tx.price} ETH
                        </div>
                      );
                    })}
                  </div>

                  <div className={style.Pagination}>
                    <div className={style.Pagination_controls}>
                      <button
                        className={style.Button}
                        onClick={() => set_tx_page(1)}
                        disabled={tx_page === 1}
                        aria-label="First page">
                        « First
                      </button>
                      <button
                        className={style.Button}
                        onClick={() => set_tx_page((p) => Math.max(1, p - 1))}
                        disabled={tx_page === 1}
                        aria-label="Previous page">
                        ‹ Prev
                      </button>
                      <span className={style.Pagination_info}>
                        Page {tx_page} of {total_pages}
                      </span>
                      <button
                        className={style.Button}
                        onClick={() =>
                          set_tx_page((p) => Math.min(total_pages, p + 1))
                        }
                        disabled={tx_page === total_pages}
                        aria-label="Next page">
                        Next ›
                      </button>
                      <button
                        className={style.Button}
                        onClick={() => set_tx_page(total_pages)}
                        disabled={tx_page === total_pages}
                        aria-label="Last page">
                        Last »
                      </button>
                    </div>

                    <label className={style.Pagination_pageSize}>
                      <span>Rows per page</span>
                      <select
                        className={style.PageSizeSelect}
                        value={tx_page_size}
                        onChange={(e) => {
                          const new_size = Number(e.target.value);
                          set_tx_page_size(new_size);
                          set_tx_page(1);
                        }}>
                        {[5, 10, 20, 50].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </>
              );
            })()
          ) : (
            <p>No transactions yet.</p>
          )}
        </div>
      )}

      {show_price_modal && (
        <div className={style.ModalOverlay} onClick={close_resell_dialog}>
          <div className={style.Modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={style.ModalTitle}>List NFT</h3>
            <p className={style.ModalSubtitle}>
              Token #{selected_nft?.tokenId}
            </p>

            <label className={style.ModalLabel}>Price (ETH)</label>
            <input
              className={style.ModalInput}
              type="number"
              min="0"
              step="0.0001"
              placeholder="0.00"
              value={price_input}
              onChange={(e) => set_price_input(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirm_resell();
                if (e.key === "Escape") close_resell_dialog();
              }}
            />

            <label className={style.ModalLabel}>Category</label>
            <select
              className={style.ModalSelect}
              value={selected_category}
              onChange={(e) => set_selected_category(e.target.value)}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <div className={style.ModalActions}>
              <button
                className={style.Button}
                onClick={close_resell_dialog}
                disabled={!!reselling_id}>
                Cancel
              </button>
              <button
                className={`${style.Button} ${style.ButtonPrimary}`}
                onClick={confirm_resell}
                disabled={!!reselling_id || !price_input || !selected_category}
                title={!price_input ? "Enter a price" : "List NFT"}>
                {reselling_id === selected_nft?.tokenId ? "Listing…" : "List"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

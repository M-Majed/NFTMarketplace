// src/app/profile/page.jsx
"use client";
import React, { useState, useEffect, useContext } from "react";
import Style from "./page.module.css";
import img from "@/lib/img";
import Image from "next/image";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import { useAccount, useBalance } from "wagmi";
import Link from "next/link";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("MyNFTs");
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ addressOrName: address });
  const [profileData, setProfileData] = useState({
    nfts: [],
    listings: [],
    transactions: [],
  });

  const { cancelListing, fetchMyNFTsOrListedNFTs, resellNFT } = useContext(
    NFTMarketplaceContext
  );
  const [chainNFTs, setChainNFTs] = useState([]);
  const [loadingChain, setLoadingChain] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [resellingId, setResellingId] = useState(null);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Art");
  const CATEGORY_OPTIONS = [
    "Art",
    "Game",
    "Nature",
    "Sport",
    "Portrait",
    "Animal",
  ]; // Prisma enum

  // pagination for transactions
const [txPage, setTxPage] = useState(1);
const [txPageSize, setTxPageSize] = useState(10);

  useEffect(() => {
  const totalPages = Math.max(1, Math.ceil((profileData.transactions?.length || 0) / txPageSize));
  if (txPage > totalPages) setTxPage(totalPages);
}, [profileData.transactions, txPage, txPageSize]);
  const openResellDialog = (nft, e) => {
    e?.stopPropagation?.();
    setSelectedNFT(nft);
    setPriceInput("");
    setSelectedCategory("Art");
    setShowPriceModal(true);
  };

  const closeResellDialog = () => {
    if (resellingId) return; // prevent closing while submitting
    setShowPriceModal(false);
    setSelectedNFT(null);
    setPriceInput("");
  };

  const confirmResell = async () => {
    if (!selectedNFT) return;
    const price = String(priceInput).trim();
    if (!/^\d+(\.\d+)?$/.test(price) || Number(price) <= 0) {
      alert("Please enter a valid positive number (ETH).");
      return;
    }
    try {
      setResellingId(selectedNFT.tokenId);
      await resellNFT({
        tokenId: selectedNFT.tokenId,
        priceEth: price,
        category: selectedCategory,
      });
      const res = await fetch(`/api/profile?address=${address}`);
      const data = await res.json();
      setProfileData(data);
      const updated = await fetchMyNFTsOrListedNFTs("MyNFTs");
      setChainNFTs(updated || []);
      closeResellDialog();
    } catch (err) {
      console.error("Resell failed:", err);
      alert(
        "Resell failed: " +
          (err?.shortMessage || err?.message || "Unknown error")
      );
    } finally {
      setResellingId(null);
    }
  };

  useEffect(() => {
    if (!isConnected) return;
    fetch(`/api/profile?address=${address}`)
      .then((res) => res.json())
      .then((data) => setProfileData(data));
  }, [address, isConnected]);

  // Load *on-chain* NFTs for the "My NFTs" tab
  useEffect(() => {
    if (!isConnected || activeTab !== "MyNFTs") return;
    let alive = true;
    setLoadingChain(true);
    fetchMyNFTsOrListedNFTs("MyNFTs")
      .then((items) => {
        if (alive) setChainNFTs(items || []);
      })
      .catch(console.error)
      .finally(() => {
        if (alive) setLoadingChain(false);
      });
    return () => {
      alive = false;
    };
  }, [isConnected, address, activeTab, fetchMyNFTsOrListedNFTs]);

  const handleCancel = async (listing, e) => {
    e?.stopPropagation?.();
    try {
      setCancellingId(listing.id);
      // On-chain cancel (pays fee to contract) + DB update (inside context->API call)
      await cancelListing({ tokenId: listing.tokenId, price: listing.price });
      // Refresh profile data
      const res = await fetch(`/api/profile?address=${address}`);
      const data = await res.json();
      setProfileData(data);
    } catch (err) {
      console.error("Cancel failed:", err);
      alert(
        "Cancel failed: " +
          (err?.shortMessage || err?.message || "Unknown error")
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (!isConnected) {
    return <p>Please connect your wallet to view your profile.</p>;
  }

  return (
    <div className={Style.Profile}>
      <div className={Style.Profile_header}>
        <div className={Style.Profile_header_avatar}>
          <Image
            src={img.user1}
            className={Style.Profile_header_avatar_img}
            alt="NFT image"
            width={70}
            height={70}
            sizes="(max-width: 600px) 56px, 70px"
          />
        </div>
        <div className={Style.Profile_info}>
          <h2>{address}</h2>
          <div className={Style.Profile_info_wallet}>
            <p>Wallet Address: {address}</p>
            <p>
              Balance:{" "}
              {balanceData
                ? `${balanceData.formatted} ${balanceData.symbol}`
                : "0.00 ETH"}
            </p>
          </div>
        </div>
      </div>
      <div className={Style.Profile_summery}>
        <div className={Style.Profile_summery_card}>
          <h2>{profileData.nfts.length}</h2>
          <p>Owned NFTs</p>
        </div>
        <div className={Style.Profile_summery_card}>
          <h2>{profileData.listings.length}</h2>
          <p>Active Listings</p>
        </div>
        <div className={Style.Profile_summery_card}>
          <h2>
            $
            {profileData.listings
              .reduce((sum, listing) => sum + parseFloat(listing.price), 0)
              .toFixed(2)}
          </h2>
          <p>Portfolio Value</p>
        </div>
      </div>
      <div className={Style.Profile_tabs}>
        <button
          className={Style.Profile_tabs_btn}
          onClick={() => setActiveTab("MyNFTs")}>
          My NFTs
        </button>
        <button
          className={Style.Profile_tabs_btn}
          onClick={() => setActiveTab("ActiveListings")}>
          {" "}
          Active Listings
        </button>
        <button
          className={Style.Profile_tabs_btn}
          onClick={() => setActiveTab("TransactionHistory")}>
          {" "}
          Transaction history
        </button>
      </div>

      {activeTab == "MyNFTs" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Owned NFTs</h2>
          {loadingChain ? (
            <p>Loading your on-chain NFTs…</p>
          ) : chainNFTs.length > 0 ? (
            <div className={Style.Profile_MyNFTs_NFTGrid}>
              {chainNFTs.map((nft) => (
                <div
                  key={nft.tokenId}
                  className={`${Style.Profile_MyNFTs_NFTGrid_card} ${
                    resellingId === nft.tokenId ? Style.isBusy : ""
                  }`}
                  onClick={(e) =>
                    resellingId ? null : openResellDialog(nft, e)
                  }
                  title={
                    resellingId === nft.tokenId
                      ? "Listing…"
                      : "Click to list this NFT"
                  }>
                  <Image
                    src={nft.image}
                    width={200}
                    height={200}
                    alt={nft.name || `Token #${nft.tokenId}`}
                    className={Style.Profile_MyNFTs_NFTGrid_card_img}
                    sizes="(max-width: 600px) 45vw, 200px"
                  />
                  <div className={Style.Profile_MyNFTs_NFTGrid_card_info}>
                    <h3>{nft.name || `Token #${nft.tokenId}`}</h3>
                    <small>
                      {resellingId === nft.tokenId
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

      {activeTab === "ActiveListings" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Active Listings</h2>
          {profileData.listings.length > 0 ? (
            <div className={Style.Profile_MyNFTs_list}>
              {profileData.listings.map((listing) => (
                <Link
                  key={listing.id}
                  href={`/nftdetails/${listing.tokenId}`}
                  className={Style.Profile_MyNFTs_list_item}>
                  {listing.nft.name} - Price: {listing.price} ETH
                  <div className={Style.Profile_MyNFTs_list_item_btns}>
                    <MdDeleteForever
                      className={`${Style.Profile_MyNFTs_list_item_btns_btn} ${
                        cancellingId === listing.id ? Style.isBusyIcon : ""
                      }`}
                      title={
                        cancellingId === listing.id
                          ? "Cancelling..."
                          : "Cancel listing"
                      }
                      onClick={(e) => {
                        // prevent navigating to details when clicking delete
                        e.preventDefault();
                        e.stopPropagation();
                        handleCancel(listing, e);
                      }}
                    />
                    <MdEdit
                      className={Style.Profile_MyNFTs_list_item_btns_btn}
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

      {activeTab == "TransactionHistory" && (
        <div className={Style.Profile_MyNFTs}>
          <h2>Transaction History</h2>
{profileData.transactions.length > 0 ? (() => {
  const start = (txPage - 1) * txPageSize;
  const end = start + txPageSize;
  const paginated = profileData.transactions.slice(start, end);
  const totalPages = Math.max(1, Math.ceil(profileData.transactions.length / txPageSize));

  return (
    <>
      <div className={Style.Profile_TransactionHistory_list}>
        {paginated.map((tx) => {
          const isSeller = tx.seller.walletAddress === address;
          return (
            <div key={tx.id} className={Style.Profile_TransactionHistory_list_item}>
              {isSeller ? "Sold" : "Bought"} {tx.nft.name} - Price: {tx.price} ETH
            </div>
          );
        })}
      </div>

      <div className={Style.Pagination}>
        <div className={Style.Pagination_controls}>
          <button
            className={Style.Button}
            onClick={() => setTxPage(1)}
            disabled={txPage === 1}
            aria-label="First page"
          >
            « First
          </button>
          <button
            className={Style.Button}
            onClick={() => setTxPage((p) => Math.max(1, p - 1))}
            disabled={txPage === 1}
            aria-label="Previous page"
          >
            ‹ Prev
          </button>
          <span className={Style.Pagination_info}>
            Page {txPage} of {totalPages}
          </span>
          <button
            className={Style.Button}
            onClick={() => setTxPage((p) => Math.min(totalPages, p + 1))}
            disabled={txPage === totalPages}
            aria-label="Next page"
          >
            Next ›
          </button>
          <button
            className={Style.Button}
            onClick={() => setTxPage(totalPages)}
            disabled={txPage === totalPages}
            aria-label="Last page"
          >
            Last »
          </button>
        </div>

        <label className={Style.Pagination_pageSize}>
          <span>Rows per page</span>
          <select
            className={Style.PageSizeSelect}
            value={txPageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setTxPageSize(newSize);
              setTxPage(1); // reset to first page when size changes
            }}
          >
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
    </>
  );
})() : (
  <p>No transactions yet.</p>
)}

        </div>
      )}
      {showPriceModal && (
        <div className={Style.ModalOverlay} onClick={closeResellDialog}>
          <div className={Style.Modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={Style.ModalTitle}>List NFT</h3>
            <p className={Style.ModalSubtitle}>Token #{selectedNFT?.tokenId}</p>
            <label className={Style.ModalLabel}>Price (ETH)</label>
            <input
              className={Style.ModalInput}
              type="number"
              min="0"
              step="0.0001"
              placeholder="0.00"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmResell();
                if (e.key === "Escape") closeResellDialog();
              }}
            />
            <label className={Style.ModalLabel}>Category</label>
            <select
              className={Style.ModalSelect}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className={Style.ModalActions}>
              <button
                className={Style.Button}
                onClick={closeResellDialog}
                disabled={!!resellingId}>
                Cancel
              </button>
              <button
                className={`${Style.Button} ${Style.ButtonPrimary}`}
                onClick={confirmResell}
                disabled={!!resellingId || !priceInput || !selectedCategory}
                title={!priceInput ? "Enter a price" : "List NFT"}>
                {resellingId === selectedNFT?.tokenId ? "Listing…" : "List"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Profile;

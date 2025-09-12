// src/app/profile/page.jsx
"use client";
import React, { useState, useEffect, useContext } from "react";
import Style from "./page.module.css";
import { useAccount, useBalance } from "wagmi";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";
import { formatEther } from "viem";
import { categories } from "@/app/constants";

// New split components
import ProfileHeader from "./ProfileHeader/ProfileHeader";
import SummaryCards from "./SummaryCards/SummaryCards";
import ProfileTabs from "./ProfileTabs/ProfileTabs";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("MyNFTs");
  const { address, isConnected } = useAccount();
  // keep for parity with original file
  const { data: balanceData } = useBalance({ addressOrName: address });

  const [profileData, setProfileData] = useState({
    listings: [],
    transactions: [],
  });

  const {
    cancelListing,
    fetchMyNFTsOrListedNFTs,
    resellNFT,
    getPendingBalance,
    withdraw,
  } = useContext(NFTMarketplaceContext);

  // on-chain owned NFTs for "MyNFTs"
  const [chainNFTs, setChainNFTs] = useState([]);
  const [loadingChain, setLoadingChain] = useState(false);

  // actions state
  const [cancellingId, setCancellingId] = useState(null);
  const [resellingId, setResellingId] = useState(null);

  // modal state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Art");
  const categoryNames = categories.map((c) => c.category);

  // pagination for transactions
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(10);

  // withdrawable earnings (on-chain)
  const [pendingWei, setPendingWei] = useState(0n);
  const [loadingPending, setLoadingPending] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const refreshPending = async () => {
    if (!isConnected) return;
    try {
      setLoadingPending(true);
      const wei = await getPendingBalance(address);
      setPendingWei(wei ?? 0n);
    } catch (e) {
      console.warn("getPendingBalance failed:", e);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    refreshPending();
  }, [address, isConnected]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((profileData.transactions?.length || 0) / txPageSize)
    );
    if (txPage > totalPages) setTxPage(totalPages);
  }, [profileData.transactions, txPageSize, txPage]);

  const handleCancel = async (listing, e) => {
    e?.stopPropagation?.();
    try {
      setCancellingId(listing.id);
      // On-chain cancel + DB update
      await cancelListing({ tokenId: listing.tokenId, price: listing.price });
      // Refresh profile data
      const res = await fetch(`/api/profile?address=${address}`);
      const data = await res.json();
      setProfileData(data);
    } catch (err) {
      console.error("Cancel failed:", err);
      alert(
        "Cancel failed: " + (err?.shortMessage || err?.message || "Unknown error")
      );
    } finally {
      setCancellingId(null);
    }
  };

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
      // refresh DB + on-chain view
      const res = await fetch(`/api/profile?address=${address}`);
      const data = await res.json();
      setProfileData(data);
      const updated = await fetchMyNFTsOrListedNFTs("MyNFTs");
      setChainNFTs(updated || []);
      closeResellDialog();
    } catch (err) {
      console.error("Resell failed:", err);
      alert(
        "Resell failed: " + (err?.shortMessage || err?.message || "Unknown error")
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

  // Load *on-chain* NFTs for the "MyNFTs" tab
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
  }, [isConnected, activeTab, fetchMyNFTsOrListedNFTs]);

  const handleWithdrawAll = async () => {
    const eth = Number(formatEther(pendingWei));
    if (!eth || eth <= 0) return;
    try {
      setWithdrawing(true);
      await withdraw({ amountEth: eth });
      await refreshPending();
      alert("Withdraw successful.");
    } catch (err) {
      console.error("Withdraw failed:", err);
      alert(
        "Withdraw failed: " +
          (err?.shortMessage || err?.message || "Unknown error")
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const portfolioValueUsd = profileData.listings
    .reduce((sum, listing) => sum + parseFloat(listing.price), 0)
    .toFixed(2);

  const totalPages = Math.max(
    1,
    Math.ceil((profileData.transactions?.length || 0) / txPageSize)
  );

  return (
    <div className={Style.Profile}>
      {/* Header */}
      <ProfileHeader
        address={address}
        loadingPending={loadingPending}
        pendingWei={pendingWei}
        withdrawing={withdrawing}
        onWithdrawAll={handleWithdrawAll}
      />

      {/* Summary cards */}
      <SummaryCards
        ownedCount={loadingChain ? null : chainNFTs.length}
        activeCount={profileData.listings.length}
        portfolioValueUsd={portfolioValueUsd}
      />

      {/* Tabs + content */}
      <ProfileTabs
        active={activeTab}
        onChange={setActiveTab}
        // MyNFTs
        myNftsItems={chainNFTs}
        myNftsLoading={loadingChain}
        resellingId={resellingId}
        onResellClick={openResellDialog}
        // Active Listings
        listings={profileData.listings}
        cancellingId={cancellingId}
        onCancelListing={handleCancel}
        // Transaction History
        transactions={profileData.transactions}
        address={address}
        txPage={txPage}
        txPageSize={txPageSize}
        totalPages={totalPages}
        onFirst={() => setTxPage(1)}
        onPrev={() => setTxPage((p) => Math.max(1, p - 1))}
        onNext={() => setTxPage((p) => Math.min(totalPages, p + 1))}
        onLast={() => setTxPage(totalPages)}
        onPageSizeChange={(n) => {
          setTxPageSize(n);
          setTxPage(1);
        }}
      />

      {/* Resell modal */}
      {showPriceModal && (
        <div className={Style.ModalOverlay} onClick={closeResellDialog}>
          <div className={Style.Modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={Style.ModalTitle}>List NFT for sale</h3>
            <p className={Style.ModalSubtitle}>
              {selectedNFT?.name || `Token #${selectedNFT?.tokenId}`}
            </p>

            <label className={Style.ModalLabel}>Price (ETH)</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              className={Style.ModalInput}
              placeholder="0.00"
            />

            <label className={Style.ModalLabel}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={Style.ModalSelect}
            >
              {categoryNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>

            <div className={Style.ModalButtons}>
              <button
                className={Style.Button}
                onClick={closeResellDialog}
                disabled={!!resellingId}
              >
                Cancel
              </button>
              <button
                className={`${Style.Button} ${Style.ButtonPrimary}`}
                onClick={confirmResell}
                disabled={!!resellingId || !priceInput || !selectedCategory}
                title={!priceInput ? "Enter a price" : "List NFT"}
              >
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

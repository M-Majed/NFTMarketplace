"use client";
import React, { useState, useEffect, useContext } from "react";
import Style from "./page.module.css";
import { useAccount, useBalance } from "wagmi";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";
import { formatEther } from "viem"; //* for converting wei to ether(wei is the smallest unit of ether)
import { categories } from "@/app/constants";
import ProfileHeader from "./ProfileHeader/ProfileHeader";
import SummaryCards from "./SummaryCards/SummaryCards";
import ProfileTabs from "./ProfileTabs/ProfileTabs";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("MyNFTs");
  const { address, isConnected } = useAccount();
  const [profileData, setProfileData] = useState({
    listings: [],
    transactions: [],
  }); //* listings and transactions of current user - fetched from db next
  const {
    cancelListing,
    fetchMyNFTs,
    resellNFT,
    getBalance,
    withdraw,
  } = useContext(NFTMarketplaceContext);

  //$ withdrawable earnings (on-chain)
  const [pendingWei, setPendingWei] = useState(0n);
  const [loadingBalance, setloadingBalance] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  //$ on-chain NFTs state
  const [chainNFTs, setChainNFTs] = useState([]);
  const [loadingChain, setLoadingChain] = useState(false);

  //$ cancel and resell state
  const [cancellingId, setCancellingId] = useState(null);
  const [resellingId, setResellingId] = useState(null);

  //$ resell modal state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceInput, setPriceInput] = useState("");
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Art");
  const categoryNames = categories.map((c) => c.category);

  //$ pagination for transactions
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(10);
  
  //$ Fetch withdrawable earnings (on-chain)
  const refreshBalance = async () => {
    if (!isConnected) return;
    try {
      setloadingBalance(true);
      const wei = await getBalance(); //* get balance on-chain
      setPendingWei(wei ?? 0n); //* value ?? default
    } catch (e) {
      console.warn("getBalance failed:", e);
    } finally {
      setloadingBalance(false);
    }
  };

  //$ get on-chain earnings
  useEffect(() => {
    refreshBalance();
  }, [address, isConnected]);

  //$ set transactions page
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((profileData.transactions?.length || 0) / txPageSize)
    );
    if (txPage > totalPages) setTxPage(totalPages);
  }, [profileData.transactions, txPageSize, txPage]);

  //$ handle cancel listing
  const handleCancel = async (listing, e) => {
    e?.stopPropagation?.(); //* prevent parent navigation
    try {
      setCancellingId(listing.id);
      await cancelListing({ tokenId: listing.tokenId, price: listing.price }); //* cancel listing on-chain and db
      const res = await fetch(`/api/profile`);
      const data = await res.json();
      setProfileData(data); //* refresh DB + on-chain view after cancelation
    } catch (err) {
      console.error("Cancel failed:", err);
      alert(
        "Cancel failed: " + (err?.shortMessage || err?.message || "Unknown error")
      );
    } finally {
      setCancellingId(null);
    }
  };

  //$ open/close resell modal
  const openResellDialog = (nft, e) => {
    e?.stopPropagation?.();
    setSelectedNFT(nft);
    setPriceInput("");
    setSelectedCategory("Art");
    setShowPriceModal(true);
  };
  const closeResellDialog = () => {
    if (resellingId) return;
    setShowPriceModal(false);
    setSelectedNFT(null);
    setPriceInput("");
  };

  //$ handle resell
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
      }); //* resell NFT on-chain and db
      const res = await fetch(`/api/profile`);
      const data = await res.json();
      setProfileData(data);  //* refresh DB + on-chain view after resell
      const updated = await fetchMyNFTs(); //* refresh on-chain NFTs
      setChainNFTs(updated || []); //* refresh on-chain NFTs
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

  //$ fetch user listings and transactions
  useEffect(() => {
    if (!isConnected) return;
    fetch(`/api/profile`)
      .then((res) => res.json())
      .then((data) => setProfileData(data));
  }, [address, isConnected]);

  //* fetch on-chain NFTs
  useEffect(() => {
    if (!isConnected || activeTab !== "MyNFTs") return;
    let alive = true; //* to prevent state updates if component unmounts(e.g., user navigates away)
    setLoadingChain(true);
    fetchMyNFTs()
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
  }, [isConnected, activeTab, fetchMyNFTs]);

  //$ handle withdraw
  const handleWithdraw = async () => {
    const eth = Number(formatEther(pendingWei)); //* convert wei to eth - pendingWei is a state
    if (!eth || eth <= 0) return;
    try {
      setWithdrawing(true);
      await withdraw({ amountEth: eth }); //* withdraw on-chain
      await refreshBalance(); //* refresh balance
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

  //$ calculate active listings value
  const activeListingsValue = profileData.listings
    .reduce((sum, listing) => sum + parseFloat(listing.price), 0)
    .toFixed(2);

  //$ pagination for transaction history
  const totalPages = Math.max(
    1,
    Math.ceil((profileData.transactions?.length || 0) / txPageSize)
  );

  return (
    <div className={Style.Profile}>
      <ProfileHeader
        address={address}
        loadingBalance={loadingBalance}
        pendingWei={pendingWei}
        withdrawing={withdrawing}
        onWithdraw={handleWithdraw}
      />

      {/* Summary cards */}
      <SummaryCards
        ownedCount={loadingChain ? null : chainNFTs.length}
        activeCount={profileData.listings.length}
        activeListingsValue={activeListingsValue}
      />

      {/* Tabs + content */}
      <ProfileTabs
        //$ which tab is active
        active={activeTab}
        onChange={setActiveTab}

        //$ MyNFTs
        myNftsItems={chainNFTs}
        myNftsLoading={loadingChain} //* loading on-chain NFTs state
        resellingId={resellingId}
        onResellClick={openResellDialog}

        //$ Active Listings
        listings={profileData.listings}
        cancellingId={cancellingId}
        onCancelListing={handleCancel}

        //$ Transaction History
        transactions={profileData.transactions}
        address={address}
        //* page and page size
        txPage={txPage} //* current page
        txPageSize={txPageSize} //* items per page
        totalPages={totalPages} //* total pages
        onFirst={() => setTxPage(1)}
        onPrev={() => setTxPage((p) => Math.max(1, p - 1))}
        onNext={() => setTxPage((p) => Math.min(totalPages, p + 1))}
        onLast={() => setTxPage(totalPages)}
        onPageSizeChange={(n) => {
          setTxPageSize(n);
          setTxPage(1);
        }}
      />

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

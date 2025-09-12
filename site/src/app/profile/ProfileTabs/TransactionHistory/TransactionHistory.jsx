"use client";
import React from "react";
import Style from "./TransactionHistory.module.css";

export default function TransactionHistory({
  transactions = [],
  address,
  page,
  pageSize,
  totalPages,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onPageSizeChange,
}) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginated = transactions.slice(start, end);

  return (
    <div className={Style.Profile_MyNFTs}>
      <h2>Transaction History</h2>

      {transactions.length > 0 ? (
        <>
          <div className={Style.Profile_TransactionHistory_list}>
            {paginated.map((tx) => {
              const isSeller =
                String(tx.seller || "").toLowerCase() ===
                String(address || "").toLowerCase();
              return (
                <div
                  key={tx.id}
                  className={Style.Profile_TransactionHistory_list_item}
                >
                  {isSeller ? "Sold" : "Bought"} {tx.nft?.name} - Price: {tx.price} ETH
                </div>
              );
            })}
          </div>

          <div className={Style.Pagination}>
            <div className={Style.Pagination_controls}>
              <button
                className={Style.Button}
                onClick={onFirst}
                disabled={page === 1}
                aria-label="First page"
              >
                « First
              </button>
              <button
                className={Style.Button}
                onClick={onPrev}
                disabled={page === 1}
                aria-label="Previous page"
              >
                ‹ Prev
              </button>
              <span className={Style.Pagination_info}>
                Page {page} of {totalPages}
              </span>
              <button
                className={Style.Button}
                onClick={onNext}
                disabled={page === totalPages}
                aria-label="Next page"
              >
                Next ›
              </button>
              <button
                className={Style.Button}
                onClick={onLast}
                disabled={page === totalPages}
                aria-label="Last page"
              >
                Last »
              </button>
            </div>

            <label className={Style.Pagination_pageSize}>
              Page size
              <select
                className={Style.PageSizeSelect}
                value={pageSize}
                onChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10))}
              >
                {[5, 10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
}

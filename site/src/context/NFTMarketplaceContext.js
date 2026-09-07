\"use client\";

import React from \"react\";
import axios from \"axios\";
import { useAccount, usePublicClient, useWriteContract } from \"wagmi\";
import { parseEther, formatEther, parseEventLogs } from \"viem\";
import { NFTMarketplaceAddress, NFTMarketplaceABI } from \"./constants\";

/**
 * React Context facilitating decentralized marketplace interactions,
 * abstracting on-chain EVM calls (minting, escrow, purchasing, withdrawals)
 * and backend PostgreSQL/SQLite database synchronizations.
 */
export const NFTMarketplaceContext = React.createContext();

/**
 * Provider component wrapping the application to expose Web3 marketplace primitives.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 */
export const NFTMarketplaceProvider = ({ children }) => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  /**
   * Queries the currently connected wallet's claimable sales proceeds from the smart contract.
   *
   * @async
   * @returns {Promise<bigint>} Withdrawable balance denominated in wei.
   * @throws {Error} If no wallet is currently connected.
   */
  const getBalance = async () => {
    if (!address) throw new Error(\"Please connect a wallet first.\");

    return await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: \"getUserBalanceOf\",
      args: [address],
    });
  };

  /**
   * Withdraws accumulated seller proceeds from contract escrow using the pull-payment pattern.
   *
   * @async
   * @param {object} params
   * @param {string|number} params.amountEth - The quantity of ETH to withdraw.
   * @returns {Promise<string>} The on-chain transaction hash.
   * @throws {Error} If wallet is disconnected or withdrawal parameters are invalid.
   */
  const withdraw = async ({ amountEth }) => {
    if (!address) throw new Error(\"Please connect a wallet first.\");
    if (!amountEth) throw new Error(\"amountEth required\");

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: \"withdraw\",
      args: [parseEther(String(amountEth))],
    });

    await publicClient.waitForTransactionReceipt({ hash });
    return hash;
  };

  /**
   * Fetches all NFTs owned by the connected wallet directly from the smart contract,
   * subsequently enriching each item with off-chain IPFS metadata.
   *
   * @async
   * @returns {Promise<Array<object>>} An array of enriched NFT token items with metadata.
   */
  const fetchMyNFTs = async () => {
    try {
      if (!address) throw new Error(\"Please connect a wallet first.\");

      const data = await publicClient.readContract({
        address: NFTMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: \"fetchMyNFTs\",
        account: address,
      });

      const items = await Promise.all(
        data.map(async (item) => {
          const tokenId = Number(item.tokenId);
          const tokenURI = await publicClient.readContract({
            address: NFTMarketplaceAddress,
            abi: NFTMarketplaceABI,
            functionName: \"tokenURI\",
            args: [BigInt(tokenId)],
          });

          let meta = {};
          try {
            const res = await axios.get(tokenURI);
            meta = res?.data || {};
          } catch (e) {
            console.warn(\"tokenURI fetch failed:\", tokenURI, e);
          }

          return {
            tokenId,
            seller: item.seller,
            owner: item.owner,
            price: Number(formatEther(item.price)),
            image: meta.image,
            name: meta.name,
            description: meta.description,
            tokenURI,
          };
        })
      );

      return items;
    } catch (error) {
      console.error(\"Error fetching NFTs:\", error);
      return [];
    }
  };

  /**
   * Mints an ERC-721 token, deposits it into escrow, and synchronizes the record with the database.
   *
   * @async
   * @param {string} url - Metadata JSON URI (IPFS / Pinata).
   * @param {string|number} formInputPrice - Asking price denominated in ETH.
   * @param {object} [dbPayload] - Off-chain metadata properties to persist to the database.
   * @returns {Promise<number>} The newly minted on-chain tokenId.
   * @throws {Error} On contract execution failure or database synchronization rejection.
   */
  const createSale = async (url, formInputPrice, dbPayload) => {
    if (!address) throw new Error(\"Please connect a wallet first.\");

    const price = parseEther(String(formInputPrice));
    const listingFee = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: \"listingFeeFor\",
      args: [price],
    });

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: \"createToken\",
      args: [url, price],
      value: listingFee,
    });
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    const logs = parseEventLogs({
      abi: NFTMarketplaceABI,
      logs: receipt.logs,
      eventName: \"MarketItemCreated\",
    });
    const tokenIdFromEvent = logs?.[0]?.args?.tokenId;
    if (tokenIdFromEvent !== undefined) {
      const tokenIdNum = Number(tokenIdFromEvent);

      if (dbPayload) {
        const {
          name,
          description,
          imageUrl,
          metadataUrl,
          width,
          height,
          size,
          category,
        } = dbPayload;

        const saveRes = await fetch(\"/api/create-nft/save-nft\", {
          method: \"POST",
          headers: { \"Content-Type\": \"application/json\" },
          body: JSON.stringify({
            tokenId: tokenIdNum,
            name,
            description,
            imageUrl,
            metadataUrl: metadataUrl ?? url,
            width,
            height,
            size,
            price: String(formInputPrice),
            category,
            txHash: hash,
          }),
        });
        const saveData = await saveRes.json().catch(() => ({}));

        if (!saveRes.ok)
          throw new Error(saveData?.error || \"Save to database failed\");
      }

      return tokenIdNum;
    }
    throw new Error(\"Failed to parse tokenId from MarketItemCreated event\");
  };

  /**
   * Purchases an actively listed NFT on-chain and updates off-chain ownership tracking.
   *
   * @async
   * @param {object} params
   * @param {number|string} params.tokenId - The token identifier to purchase.
   * @param {number|string} params.price - Purchase price in ETH.
   * @returns {Promise<string>} The confirmed transaction hash.
   * @throws {Error} If purchase validation or contract execution fails.
   */
  const buyNFT = async ({ tokenId, price }) => {
    if (!address) throw new Error(\"Please connect a wallet first.\");
    if (tokenId === undefined || tokenId === null)
      throw new Error(\"tokenId required\");
    if (price === undefined || price === null)
      throw new Error(\"price required\");

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: \"createMarketSale\",
      args: [BigInt(tokenId)],
      value: parseEther(String(price)),
    });
    await publicClient.waitForTransactionReceipt({ hash });

    const res = await fetch(\"/api/buy-nft\", {
      method: \"POST\",
      headers: { \"Content-Type\": \"application/json\" },
      body: JSON.stringify({
        tokenId: Number(tokenId),
        price: String(price),
        txHash: hash,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(data?.error || \"Failed to update DB after purchase\");

    return hash;
  };

  /**
   * Cancels an active market listing, returning NFT custody from contract escrow to the seller.
   *
   * @async
   * @param {object} nft - NFT listing object containing tokenId and price.
   * @returns {Promise<string>} The confirmed transaction hash.
   * @throws {Error} If cancellation fee payment or transaction confirmation fails.
   */
  const cancelListing = async (nft) => {
    if (!address) throw new Error(\"Please connect a wallet first.\");

    const fee = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: \"listingFeeFor\",
      args: [parseEther(String(nft.price))],
    });

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: \"cancelListing\",
      args: [BigInt(nft.tokenId)],
      value: fee,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    const res = await fetch(\"/api/cancel-sell\", {
      method: \"POST\",
      headers: { \"Content-Type\": \"application/json\" },
      body: JSON.stringify({
        tokenId: Number(nft.tokenId),
        txHash: hash,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(data?.error || \"Failed to update DB after cancel\");

    return hash;
  };

  /**
   * Checks and grants operator approval for the marketplace contract to manage ERC-721 tokens.
   *
   * @async
   * @private
   */
  const ensureApprovalForAll = async () => {
    if (!address) throw new Error(\"Please connect a wallet first.\");

    const alreadyApproved = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: \"isApprovedForAll\",
      args: [address, NFTMarketplaceAddress],
    });

    if (!alreadyApproved) {
      const hash = await writeContractAsync({
        address: NFTMarketplaceAddress,
        abi: NFTMarketplaceABI,
        functionName: \"setApprovalForAll\",
        args: [NFTMarketplaceAddress, true],
      });
      await publicClient.waitForTransactionReceipt({ hash });
    }
  };

  /**
   * Relists an owned NFT on the marketplace with a new price and category.
   *
   * @async
   * @param {object} params
   * @param {number|string} params.tokenId - Identifier of the token to resell.
   * @param {number|string} params.priceEth - New listing price in ETH.
   * @param {string} [params.category] - Product classification category.
   * @returns {Promise<string>} The confirmed transaction hash.
   */
  const resellNFT = async ({ tokenId, priceEth, category }) => {
    if (!address) throw new Error(\"Please connect a wallet first.\");
    if (tokenId === undefined || tokenId === null)
      throw new Error(\"tokenId required\");
    if (!priceEth) throw new Error(\"priceEth required\");

    const priceWei = parseEther(String(priceEth));
    const listingFee = await publicClient.readContract({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: \"listingFeeFor\",
      args: [priceWei],
    });

    await ensureApprovalForAll();

    const hash = await writeContractAsync({
      address: NFTMarketplaceAddress,
      abi: NFTMarketplaceABI,
      functionName: \"resellToken\",
      args: [BigInt(tokenId), priceWei],
      value: listingFee,
    });
    await publicClient.waitForTransactionReceipt({ hash });

    const res = await fetch(\"/api/resell\", {
      method: \"POST\",
      headers: { \"Content-Type\": \"application/json\" },
      body: JSON.stringify({
        tokenId: Number(tokenId),
        price: String(priceEth),
        txHash: hash,
        category,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || \"Failed to update DB after resell\");
    return hash;
  };

  return (
    <NFTMarketplaceContext.Provider
      value={{
        createSale,
        fetchMyNFTs,
        buyNFT,
        cancelListing,
        resellNFT,
        getBalance,
        withdraw,
      }}>
      {children}
    </NFTMarketplaceContext.Provider>
  );
};

// src/app/api/fetch-nfts/route.js
import axios from "axios";
import { ethers } from "ethers";
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "@/context/constants";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rpc_provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const marketplace_contract = new ethers.Contract(
      NFTMarketplaceAddress,
      NFTMarketplaceABI,
      rpc_provider
    );

    const raw_items = await marketplace_contract.fetchMarketItems();

    const items = await Promise.all(
      raw_items.map(
        async ({ tokenId, seller, owner, price: unformatted_price }) => {
          const token_uri = await marketplace_contract.tokenURI(tokenId);
          const {
            data: { image, description, name },
          } = await axios.get(token_uri);

          const price = ethers.formatUnits(unformatted_price, "ether");

          return {
            price,
            tokenId: Number(tokenId),
            seller,
            owner,
            image,
            name,
            description,
            tokenURI: token_uri,
          };
        }
      )
    );

    return Response.json(items);
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return Response.json([], { status: 500 });
  }
}

import { ethers } from "ethers";
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "@/context/constants";
import axios from "axios";
export const runtime = "nodejs";

export async function GET() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(
      NFTMarketplaceAddress,
      NFTMarketplaceABI,
      provider
    );
    const data = await contract.fetchMarketItems();
    const items = await Promise.all(
      data.map(
        async ({ tokenId, seller, owner, price: unformattedPrice }) => {
          const tokenURI = await contract.tokenURI(tokenId);
          const {
            data: { image, description, name },
          } = await axios.get(tokenURI);
          const price = ethers.formatUnits(unformattedPrice, "ether");

          return {
            price,
            tokenId: Number(tokenId),
            seller,
            owner,
            image,
            name,
            description,
            tokenURI,
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
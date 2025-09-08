import { ethers } from "ethers";
import { NFTMarketplaceAddress, NFTMarketplaceABI } from "@/context/constants";
import axios from "axios";
export const runtime = "nodejs";

export async function GET() {
  try {
    //* Connect to the Ethereum network and contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const contract = new ethers.Contract(
      NFTMarketplaceAddress,
      NFTMarketplaceABI,
      provider
    );

    //* Fetch the NFTs from the contract
    const data = await contract.fetchMyNFTs();

    //* Process each NFT to get its metadata
    const items = await Promise.all(
      data.map(async ({ tokenId, seller, owner, price: unformattedPrice }) => {
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
      })
    );

    //* Return the processed NFT items
    return Response.json(items);
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return Response.json([], { status: 500 });
  }
}

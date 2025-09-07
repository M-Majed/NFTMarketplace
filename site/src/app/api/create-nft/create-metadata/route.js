// src/app/api/create-nft/create-metadata/route.js
import axios from "axios";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { name, description, image } = await request.json();

    if (!name || !description || !image) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
      });
    }

    const payload_json = JSON.stringify({ name, description, image });

    const pinata_res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      payload_json,
      {
        headers: {
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const ipfs_hash = pinata_res.data.IpfsHash;
    const ipfs_url = `https://gateway.pinata.cloud/ipfs/${ipfs_hash}`;

    return new Response(JSON.stringify({ url: ipfs_url }), { status: 200 });
  } catch (error) {
    console.error("IPFS metadata error:", error);
    return new Response(JSON.stringify({ error: "IPFS pin failed" }), {
      status: 500,
    });
  }
}

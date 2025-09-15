import axios from 'axios';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.address) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const { name, description, image } = await request.json();
    //* Validation
    if (!name || !description || !image) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }
    if (typeof name !== "string" || typeof description !== "string" || typeof image !== "string") {
      return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
    }
    if (name.length > 120) {
      return new Response(JSON.stringify({ error: "Name too long (max 120 chars)" }), { status: 400 });
    }
    if (description.length > 2000) {
      return new Response(JSON.stringify({ error: "Description too long (max 2000 chars)" }), { status: 400 });
    }

    //* Create metadata object
    const data = JSON.stringify({ name, description, image });
    //* Pin metadata to IPFS via Pinata
    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data, {
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
        'Content-Type': 'application/json',
      },
    });
    //* return IPFS URL
    const url = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    return new Response(JSON.stringify({ url }), { status: 200 });
  } catch (error) {
    console.error('Error creating metadata on IPFS:', error);
    return new Response(JSON.stringify({ error: 'Metadata creation failed' }), { status: 500 });
  }
}
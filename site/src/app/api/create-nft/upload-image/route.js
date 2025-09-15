import axios from 'axios';
import FormData from 'form-data';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.address) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    //* validation
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }
    if (typeof file.name !== "string" || !file.type?.startsWith("image/")) {
      return new Response(JSON.stringify({ error: "Only image files are allowed" }), { status: 400 });
    }

    //* read file as buffer(nodejs compatiblity)
    const buffer = Buffer.from(await file.arrayBuffer());
    const sizeBytes = buffer.length;
    if (sizeBytes > 50 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "File too large (max 50MB)" }), { status: 400 });
    }

    //* upload to pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', buffer, { filename: file.name, contentType: file.type });
    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', pinataFormData, {
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
        ...pinataFormData.getHeaders(),
      },
    });

    //* return the ipfs url
    const imgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    return new Response(JSON.stringify({ url: imgHash }), { status: 200 });
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
}
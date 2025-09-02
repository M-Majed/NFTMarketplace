// src/app/api/create-nft/upload-image/route.js
import axios from 'axios';
import FormData from 'form-data';
export const runtime = "nodejs";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
    }

    // Read file as Buffer for Node.js compatibility
    const buffer = Buffer.from(await file.arrayBuffer());

    const pinataFormData = new FormData();
    pinataFormData.append('file', buffer, { filename: file.name, contentType: file.type });

    const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', pinataFormData, {
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
        ...pinataFormData.getHeaders(),
      },
    });

    const imgHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    return new Response(JSON.stringify({ url: imgHash }), { status: 200 });
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
}
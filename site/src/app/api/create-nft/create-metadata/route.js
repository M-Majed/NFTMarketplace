// src/app/api/create-nft/create-metadata/route.js
import axios from 'axios';

export async function POST(request) {
  try {
    const { name, description, image } = await request.json();

    if (!name || !description || !image) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const data = JSON.stringify({ name, description, image });

    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', data, {
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    const { IpfsHash } = response.data;
    const url = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;
    return new Response(JSON.stringify({ url, hash: IpfsHash }), { status: 200 });
  } catch (error) {
    console.error('Error creating metadata on IPFS:', error);
    return new Response(JSON.stringify({ error: 'Metadata creation failed' }), { status: 500 });
  }
}
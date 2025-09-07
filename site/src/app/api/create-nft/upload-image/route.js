// src/app/api/create-nft/upload-image/route.js
import axios from "axios";
import FormData from "form-data";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const form_data = await request.formData();
    const file_obj = form_data.get("file");

    if (!file_obj) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
      });
    }

    const file_buffer = Buffer.from(await file_obj.arrayBuffer());

    const pinata_form_data = new FormData();
    pinata_form_data.append("file", file_buffer, {
      filename: file_obj.name,
      contentType: file_obj.type,
    });

    const pinata_res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      pinata_form_data,
      {
        headers: {
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
          ...pinata_form_data.getHeaders(),
        },
      }
    );

    const ipfs_url = `https://gateway.pinata.cloud/ipfs/${pinata_res.data.IpfsHash}`;
    return new Response(JSON.stringify({ url: ipfs_url }), { status: 200 });
  } catch (error) {
    console.error("Error uploading image to IPFS:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}

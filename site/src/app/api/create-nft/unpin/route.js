// src/app/api/create-nft/unpin/route.js
import axios from "axios";

export async function POST(request) {
  try {
    // Support normal fetch + sendBeacon('text/plain')
    let payload;
    try { payload = await request.json(); }
    catch {
      const text = await request.text();
      payload = text ? JSON.parse(text) : {};
    }

    const hashes = Array.isArray(payload?.hashes) ? payload.hashes.filter(Boolean) : [];
    if (!hashes.length) {
      return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200 });
    }

    await Promise.allSettled(
      hashes.map((h) =>
        axios.delete(`https://api.pinata.cloud/pinning/unpin/${h}`, {
          headers: {
            pinata_api_key: process.env.PINATA_API_KEY,
            pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
          },
        })
      )
    );

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e) {
    console.error("Unpin failed:", e);
    return new Response(JSON.stringify({ ok: false }), { status: 500 });
  }
}

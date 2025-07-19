// src/app/api/upload/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import imageSize from "image-size";
import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // ensure Node.js runtime for fs/image-size

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const itemName = formData.get("itemName");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = parseFloat(formData.get("price"));
    const address     = formData.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 }
      );
    }
    if (!(file && itemName && description && category && price)) {
      return NextResponse.json(
        {
          error: "Missing one of: file, itemName, description, category, price",
        },
        { status: 400 }
      );
    }

    // ─── Save the uploaded image ────────────────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const filename = `${Date.now()}-${file.name}`;
    fs.writeFileSync(path.join(uploadsDir, filename), buffer);

    // ─── Extract dimensions ────────────────────────────────────────────────
    const { width, height } = imageSize(buffer);

    // ─── Reject images outside 200×200–3500×3500 ─────────────────────────
    if (width < 200 || height < 200 || width > 3500 || height > 3500) {
      return NextResponse.json(
        { error: "Image must be between 200×200 and 3500×3500 pixels." },
        { status: 400 }
      );
    }
    // ─── 1) Create the NFT, connecting it to user 1 as owner ──────────────
   const tokenId        = formData.get("tokenId");
   const contractAddress = formData.get("contractAddress");

   if (!tokenId || !contractAddress) {
     return NextResponse.json(
       { error: "Missing on-chain tokenId or contractAddress" },
       { status: 400 }
     );
   }
   const nft = await prisma.nFT.create({
      data: {
        title: itemName,
        description, // your user‐entered description
        imageUrl: `/uploads/${filename}`,
        category, // must match your Category enum
        width,
        height,
        tokenId, // unique on‐chain token ID
        contractAddress: "", // blank for now
        metadata: {
          title: itemName,
          width,
          height,
          tokenId,
          contractAddress: "",
          tokenId,
          contractAddress,
        },
        owner: {
          connect: { walletAddress: address },
        },
      },
    });

    // ─── 2) Create the Listing for that same user ─────────────────────────
    const listing = await prisma.listing.create({
      data: {
        price,
        status: "ACTIVE", // your enum ListingStatus
        nft: { connect: { id: nft.id } },
        seller: { connect: { walletAddress: address } },
        description,
      },
    });

    return NextResponse.json({ nft, listing });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

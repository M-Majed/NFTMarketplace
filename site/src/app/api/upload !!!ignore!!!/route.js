// src/app/api/upload/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import imageSize from "image-size";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageField = formData.get("image");
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = parseFloat(formData.get("price"));
    const address = formData.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Missing wallet address" },
        { status: 400 }
      );
    }
    if (!(imageField && name && description && category && price)) {
      return NextResponse.json(
        { error: "Missing one of: image, name, description, category, price" },
        { status: 400 }
      );
    }

    let imageUrl;
    let width;
    let height;

    // Handle either a Pinata IPFS URL or an uploaded file
    if (typeof imageField === "string") {
      // imageField is a URL
      imageUrl = imageField;
      // Fetch remote image to get dimensions
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const dimensions = imageSize(buffer);
      width = dimensions.width;
      height = dimensions.height;
    } else {
      // imageField is a File upload
      const buffer = Buffer.from(await imageField.arrayBuffer());
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
      const imagename = `${Date.now()}-${imageField.name}`;
      fs.writeFileSync(path.join(uploadsDir, imagename), buffer);
      const dimensions = imageSize(buffer);
      width = dimensions.width;
      height = dimensions.height;
      imageUrl = `/uploads/${imagename}`;
    }

    // Validate dimensions
    if (width < 200 || height < 200 || width > 3500 || height > 3500) {
      return NextResponse.json(
        { error: "Image must be between 200×200 and 3500×3500 pixels." },
        { status: 400 }
      );
    }

    // Create NFT record
    const tokenId = uuidv4();
    const nft = await prisma.nFT.create({
      data: {
        title: name,
        description,
        imageUrl,
        category,
        width,
        height,
        tokenId,
        contractAddress: "",
        metadata: {
          title: name,
          width,
          height,
          tokenId,
          contractAddress: "",
        },
        owner: { connect: { walletAddress: address } },
      },
    });

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        price,
        status: "ACTIVE",
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

// src/app/api/users/route.js
import { NextResponse }   from "next/server";
import { PrismaClient }   from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  const { address } = await request.json();
  if (!address) {
    return NextResponse.json(
      { error: "Missing wallet address" },
      { status: 400 }
    );
  }

  // Upsert by walletAddress: create only if not exists
  const user = await prisma.user.upsert({
    where: { walletAddress: address },
    update: {},  // no changes if already there
    create: {
      name:          address.slice(0, 6),        // default name
      walletAddress: address,
      avatarUrl:     "/Avatar/default.png",      // or your placeholder
    },
  });

  return NextResponse.json(user);
}

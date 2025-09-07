// src/app/api/users/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(request) {
  const { walletAddress: wallet_address } = await request.json();

  if (!wallet_address) {
    return NextResponse.json(
      { error: "walletAddress is required" },
      { status: 400 }
    );W
  }

  const user_record = await prisma.user.upsert({
    where: { walletAddress: wallet_address },
    update: {},
    create: { walletAddress: wallet_address },
  });

  return NextResponse.json(user_record);
}

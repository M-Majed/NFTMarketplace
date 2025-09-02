// src/app/api/users/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma }      from "@/lib/prisma";

export async function POST(request) {
  const { walletAddress } = await request.json();
  if (!walletAddress) {
    return NextResponse.json(
      { error: "walletAddress is required" },
      { status: 400 }
    );
  }

  // upsert: create if new, otherwise no-op
  const user = await prisma.user.upsert({
    where:  { walletAddress },
    update: {},
    create: {
      walletAddress,
    },
  });

  return NextResponse.json(user);
}
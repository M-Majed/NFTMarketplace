export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma }      from "@/lib/prisma";

export async function POST(request) {
  const { walletAddress } = await request.json();

  //*check if walletAddress is provided
  if (!walletAddress) {
    return NextResponse.json(
      { error: "walletAddress is required" },
      { status: 400 }
    );
  }

  //* add user to db if not exists
  const user = await prisma.user.upsert({
    where:  { walletAddress },
    update: {},
    create: {
      walletAddress,
    },
  });

  return NextResponse.json(user);
}
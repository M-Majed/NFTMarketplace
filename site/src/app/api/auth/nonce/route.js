import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";

export async function GET() {
  const nonce = randomBytes(16).toString("base64");
  // save it to your DB so you can verify later
  await prisma.nonce.create({ data: { value: nonce } });
  return NextResponse.json({ nonce });
}

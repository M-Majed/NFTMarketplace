import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export async function POST(req) {
  try {
    const { listingId, walletAddress, reason } = await req.json();

    //$ validation
    if (!listingId || !walletAddress) {
      return NextResponse.json(
        { error: "listingId and walletAddress are required" },
        { status: 400 }
      );
    }

    //$ find listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    //$ find or create user
    let user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      user = await prisma.user.create({ data: { walletAddress } });
    }

    //$ create report
    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        listingId,
        reason: reason ?? null,
      },
    });

    return NextResponse.json({ ok: true, report });
  } catch (err) {
    if (err?.code === "P2002") {
      return NextResponse.json(
        {
          ok: true,
          alreadyReported: true,
          message: "You already reported this listing.",
        },
        { status: 200 }
      );
    }
    console.error("REPORT_POST_ERR", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

//$ check “already reported”
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  const walletAddress = searchParams.get("walletAddress");

  //$ validation
  if (!listingId || !walletAddress) {
    return NextResponse.json(
      { error: "listingId and walletAddress are required" },
      { status: 400 }
    );
  }
  //$ find user
  const user = await prisma.user.findUnique({ where: { walletAddress } });
  if (!user) return NextResponse.json({ reported: false });
  //$ check report
  const exists = await prisma.report.findFirst({
    where: { listingId, reporterId: user.id },
    select: { id: true },
  });

  return NextResponse.json({ reported: !!exists });
}

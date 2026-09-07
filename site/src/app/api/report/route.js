import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
const prisma = globalThis.prisma || new PrismaClient();

export async function POST(req) {
  try {
    const { listingId, reason } = await req.json();
    const session = await getServerSession(authOptions);
    if (!session?.user?.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const reporterAddress = session.user.address.toLowerCase();
    // Validation
    if (!listingId) {
      return NextResponse.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }

    // Find listing
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Find or create reporter
    const user = await prisma.user.upsert({
      where: { walletAddress: reporterAddress },
      update: {},
      create: { walletAddress: reporterAddress },
    });

    // Create report
    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        listingId,
        reason: typeof reason === "string" ? reason.slice(0, 500) : null,
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

// Check “already reported”
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  const session = await getServerSession(authOptions);
  if (!session?.user?.address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const reporterAddress = session.user.address.toLowerCase();

  // Validation
  if (!listingId) {
    return NextResponse.json(
      { error: "listingId is required" },
      { status: 400 }
    );
  }
  // Find user
  const user = await prisma.user.findUnique({ where: { walletAddress: reporterAddress } });
  if (!user) return NextResponse.json({ reported: false });
  // Check report
  const exists = await prisma.report.findFirst({
    where: { listingId, reporterId: user.id },
    select: { id: true },
  });

  return NextResponse.json({ reported: !!exists });
}

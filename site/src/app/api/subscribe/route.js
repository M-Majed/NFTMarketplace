// app/api/subscribe/route.js
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

//* validation
const isValidEmail = (email) =>
  typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email." },
        { status: 400 }
      );
    }

    const normalized = email.trim().toLowerCase();
    //* add to DB if not exists
    await prisma.subscriber.upsert({
      where: { email: normalized },
      update: {},
      create: { email: normalized },
    });

    return NextResponse.json({ ok: true, message: "Subscribed!" }, { status: 200 });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

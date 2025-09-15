// File: app/api/auth/[...nextauth]/route.js

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      },
      async authorize(credentials, req) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials?.message || "{}"));
          // NextAuth stores the CSRF token in a cookie: "next-auth.csrf-token" with format "<token>|<hash>"
          const raw = cookies().get("next-auth.csrf-token")?.value || "";
          const nonce = raw.split("|")[0] || "";
          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL);
          const result = await siwe.verify({
            signature: credentials?.signature || "",
            domain: nextAuthUrl.host,
            nonce,
          });

          // 2. If verification is successful, proceed
          if (result.success) {
            const walletAddress = siwe.address.toLocaleLowerCase();

            // 3. SECURELY add the user to the database.
            // This is the logic from your old `/api/add-user` route.
            const user = await prisma.user.upsert({
              where: { walletAddress },
              update: {},
              create: { walletAddress },
            });

            // Return the user object for the session
            return {
              id: user.id,
              address: walletAddress,
            };
          }
          return null; // Return null if verification fails
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, // IMPORTANT: Set this in .env.local
  callbacks: {
    async jwt({ token, user }) {
      // Persist wallet address on the token when sign-in happens
      if (user?.address) token.address = user.address;
      return token;
    },
    async session({ session, token }) {
      // Expose both DB id and wallet address in the session
      session.user.id = token.sub;        // cuid from your DB
      session.user.address = token.address;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
// NextAuth configuration for Next.js
// Authenticates users with SIWE (Sign-In With Ethereum)

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"; // A NextAuth.js provider to handle SIWE process - require client to send msg and signature
import { SiweMessage } from "siwe"; // Helps create and verify SIWE messages
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers"; // Read cookies from server-side request

// NextAuth configuration to use in NextAuth handler and reuse in getServerSession
export const authOptions = {
  // Defines how a user can authenticate
  providers: [
    CredentialsProvider({
      name: "Ethereum", // Give name to provider
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      }, // What data the provider expects from the client for authentication

      // Check if credentials are valid
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          ); // Create SIWE message object from client message
          const raw = cookies().get("next-auth.csrf-token")?.value || ""; // Get csrf token from cookies
          const nonce = raw.split("|")[0] || ""; // Get nonce from csrf token

          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL);
          const result = await siwe.verify({
            signature: credentials?.signature || "", // Check signature
            domain: nextAuthUrl.host, // Check if SIWE message domain == NEXTAUTH_URL
            nonce, // Check if SIWE message nonce == csrf token nonce
          });

          if (result.success) {
            const walletAddress = siwe.address.toLocaleLowerCase();

            // Create user if not exists
            const user = await prisma.user.upsert({
              where: { walletAddress },
              update: {},
              create: { walletAddress },
            });

            return {
              id: user.id,
              address: walletAddress,
            };
          }
          return null;
        } catch (e) {
          return null;
        }
      },
    }),
  ],

  // Use JSON Web Tokens for managing user sessions instead of db
  session: {
    strategy: "jwt",
  },

  // To encrypt/decrypt JWT
  secret: process.env.NEXTAUTH_SECRET,

  // Allows to customize the behavior of JWT
  callbacks: {
    // Checks if a user object was returned from the authorize function
    // If yes: add address to token => walletAddress available in JWT
    // Runs when a JWT is created
    async jwt({ token, user }) {
      if (user?.address) token.address = user.address;
      return token;
    },
    // Add user id and address from JWT token to session
    // Runs when a session is created
    // Makes user id and address available on client side using useSession
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.address = token.address;
      return session;
    },
  },
};
// Create NextAuth handler API route
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

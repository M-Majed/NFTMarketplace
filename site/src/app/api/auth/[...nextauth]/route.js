//$ NextAuth configuration for Next.js
//$ authenticates users with SIWE (Sign-In With Ethereum)

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"; //* A NextAuth.js provider to handle SIWE process - require client to send msg and signature
import { SiweMessage } from "siwe"; //* helps create and verify SIWE messages
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers"; //* read cookies from server-side request

//$ NextAuth configuration to use in NextAuth handler and reuse in getServerSession
export const authOptions = {
  //$ defines how a user can authenticate
  providers: [
    CredentialsProvider({
      name: "Ethereum", //* give name to provider
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
      }, //* what data the provider expects from the client for authentication

      //$ check if credentials are valid
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          ); //* create SIWE message object from client message
          const raw = cookies().get("next-auth.csrf-token")?.value || ""; //* get csrf token from cookies
          const nonce = raw.split("|")[0] || ""; //* get nonce from csrf token

          const nextAuthUrl = new URL(process.env.NEXTAUTH_URL);
          const result = await siwe.verify({
            signature: credentials?.signature || "", //* check signiature
            domain: nextAuthUrl.host, //* check if SIWE message domain == NEXTAUTH_URL
            nonce, //* check if SIWE message nonce == csrf token nonce
          });

          if (result.success) {
            const walletAddress = siwe.address.toLocaleLowerCase();

            //* Create user if not exists
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

  //$ use JSON Web Tokens for managing user sessions instead of db
  session: {
    strategy: "jwt",
  },

  //$ to encrypt/decrypt JWT
  secret: process.env.NEXTAUTH_SECRET,

  //$ allows to customize the behavior of JWT
  callbacks: {
    //* checks if a user object was returned from the authorize function
    //* if yes: add address to token => walletAddress awailable in JWT
    //* runs when a JWT is created
    async jwt({ token, user }) {
      if (user?.address) token.address = user.address;
      return token;
    },
    //* add user id and address from JWT token to session
    //* runs when a session is created
    //* makes user id and address available on client side using useSession
    async session({ session, token }) {
      session.user.id = token.sub;
      session.user.address = token.address;
      return session;
    },
  },
};
//$ create NextAuth handler API route
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

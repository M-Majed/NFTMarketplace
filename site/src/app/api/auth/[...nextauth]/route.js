import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github"; // optional: for fallback
import { SiweMessage } from "siwe";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message:  { label: "Message",  type: "text" },
        signature:{ label: "Signature", type: "text" },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(JSON.parse(credentials.message));
          const { data: session } = siwe.verify({
            signature: credentials.signature,
            domain:     process.env.NEXTAUTH_URL.replace(/^https?:\/\//, ""),
            nonce:      await getNonceFromYourDatabase(),    // see below
          });
          // session.address is now the wallet address
          return { id: session.address };
        } catch {
          return null;
        }
      },
    }),
    // you can add other providers if you want...
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in, user.id === address
      if (user) token.address = user.id;
      return token;
    },
    async session({ session, token }) {
      session.address = token.address;
      return session;
    },
  },
};

export default NextAuth(authOptions);

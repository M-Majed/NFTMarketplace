//$ initialize:
//$ Wagmi: collection of react hooks for EVM -> ex: chain, useAccount, ...
//$ RainbowKit: UI to connect wallets
//$ React Query: handle data fetching/caching/state - components use cached data
//$ NextAuth: handle authentication, sessions, 

"use client";
import React from "react";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; //* Declarative data fetching + caching
import { SessionProvider } from "next-auth/react";

//$ Define Hardhat test-chain
const hardhatLocal = {
  id: 1337,
  name: "Hardhat Localhost",
  network: "localhost",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
  },
  testnet: true,
};

//$ Build the Wagmi/RainbowKit config, including Mainnet + Hardhat
const wagmiConfig = getDefaultConfig({
  appName: "My NFT Marketplace",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID, //* got from website
  chains: [mainnet, hardhatLocal], //* allow connections from mainnet and local-chain
  ssr: true, //* enables Wagmi’s SSR-friendly for inconsistency with server
});

//* Create a React Query client - for caching
const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <SessionProvider refetchOnWindowFocus={false}> {/* false: no refetch when user returns to tab */}
          <RainbowKitProvider chains={wagmiConfig.chains} theme={darkTheme()}>
            {children}
          </RainbowKitProvider>
        </SessionProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

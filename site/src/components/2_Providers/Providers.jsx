//$ initialize:
//$ Wagmi (EVM wallet/client + connectors)
//$ RainbowKit (connect modal & wallet UI, theming)
//$ React Query (network/cache layer for your API/data)
//$ …and to register both Mainnet and a local Hardhat chain so you can switch between them.

"use client";
import React from "react";
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from "@rainbow-me/rainbowkit"; //* rainbowkit UI
//* Wallet connections, public client, chain metadata.
import { WagmiProvider } from "wagmi";
import { mainnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; //* Declarative data fetching + caching
import { SessionProvider } from "next-auth/react"; // <-- IMPORT THIS

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

//* Create a React Query client - for cache stuff like data fetching
const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {" "}
      {/* Makes React Query available to entire app */}
      <WagmiProvider config={wagmiConfig}>
        {" "}
        {/* Makes EVM clinet/connectors available to entire app */}
        <SessionProvider refetchOnWindowFocus={false}>
          <RainbowKitProvider chains={wagmiConfig.chains} theme={darkTheme()}>
            {" "}
            {/* Makes RainbowKit UI available to entire app */}
            {children}
          </RainbowKitProvider>
        </SessionProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

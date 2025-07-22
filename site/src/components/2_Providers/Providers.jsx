// src/components/2_Providers/Providers.jsx
'use client';

import React from 'react';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider }                        from 'wagmi';
import { mainnet }                              from 'wagmi/chains';
import { QueryClient, QueryClientProvider }     from '@tanstack/react-query';

// Define your local Hardhat chain
const hardhatLocal = {
  id: 1337,
  name: 'Hardhat Localhost',
  network: 'localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
  testnet: true,
};

// Build the Wagmi/RainbowKit config, including Mainnet + Hardhat
const wagmiConfig = getDefaultConfig({
  appName:   'My NFT Marketplace',
  projectId: 'YOUR_PROJECT_ID',      // ← replace with your actual Project ID
  chains:    [mainnet, hardhatLocal],
  ssr:       true,
});

// Create a React Query client
const queryClient = new QueryClient();

// **Make this the default export**
export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider chains={wagmiConfig.chains} theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

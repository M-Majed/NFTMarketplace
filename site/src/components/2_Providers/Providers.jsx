'use client';

import React from 'react';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider }                        from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { QueryClient, QueryClientProvider }     from '@tanstack/react-query';

// 1) Build the Wagmi/RainbowKit config on the client
const wagmiConfig = getDefaultConfig({
  appName:   'My NFT Marketplace',
  projectId: 'YOUR_PROJECT_ID',     // ← fill this in
  chains:    [mainnet],
  ssr:       true,                  // enables SSR support
});

// 2) Instantiate React-Query client
const queryClient = new QueryClient();

export default function Providers({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()} chains={wagmiConfig.chains}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

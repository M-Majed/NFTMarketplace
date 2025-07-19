// 'use client';

// import React from 'react';
// import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
// import { WagmiProvider }                        from 'wagmi';
// import { mainnet } from 'wagmi/chains';
// import { QueryClient, QueryClientProvider }     from '@tanstack/react-query';

// // 1) Build the Wagmi/RainbowKit config on the client
// const wagmiConfig = getDefaultConfig({
//   appName:   'My NFT Marketplace',
//   projectId: 'YOUR_PROJECT_ID',     // ← fill this in
//   chains:    [mainnet],
//   ssr:       true,                  // enables SSR support
// });

// // 2) Instantiate React-Query client
// const queryClient = new QueryClient();

// export default function Providers({ children }) {
//   return (
//     <WagmiProvider config={wagmiConfig}>
//       <QueryClientProvider client={queryClient}>
//         <RainbowKitProvider theme={darkTheme()} chains={wagmiConfig.chains}>
//           {children}
//         </RainbowKitProvider>
//       </QueryClientProvider>
//     </WagmiProvider>
//   );
// }

//! revert to the original code
// src/Providers.jsx
'use client';

import React from 'react';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider }                        from 'wagmi';
import { mainnet }                              from 'wagmi/chains';
import { QueryClient, QueryClientProvider }     from '@tanstack/react-query';

// Define your local Hardhat chain
const hardhatLocal = {
  id: 31337,
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

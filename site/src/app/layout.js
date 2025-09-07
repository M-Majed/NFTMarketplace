// src/app/layout.js
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";

import Header from "@/components/0_FooterHeader/Header/Header";
import Footer from "@/components/0_FooterHeader/Footer/Footer";
import Providers from "@/components/2_Providers/Providers";
import { NFTMarketplaceProvider } from "@/context/NFTMarketplaceContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NFTMarketplaceProvider>
            <Header />
            {children}
            <Footer />
          </NFTMarketplaceProvider>
        </Providers>
      </body>
    </html>
  );
}

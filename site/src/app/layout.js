import "./globals.css";
import Footer from "@/components/0_FooterHeader/Footer/Footer";
import Header from "@/components/0_FooterHeader/Header/Header";

import Providers from "@/components/2_Providers/Providers";
import "@rainbow-me/rainbowkit/styles.css";  

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}

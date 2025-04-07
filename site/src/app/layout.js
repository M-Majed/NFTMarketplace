import "./globals.css";
import Footer from "@/components/0_FooterHeader/Footer/Footer";
import Header from "@/components/0_FooterHeader/Header/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

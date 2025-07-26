import "../styles/globals.css";

//INTRNAL IMPORT
 import { NFTMarketplaceProvider } from "../Context/NFTMarketplaceContext";

 const MyApp = ({ Component, pageProps }) => (
  <div>
    <NFTMarketplaceProvider>
      <Component {...pageProps} />
    </NFTMarketplaceProvider>
  </div>
);

export default MyApp;

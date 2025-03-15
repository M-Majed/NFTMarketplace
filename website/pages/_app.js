import "@/styles/globals.css";
import {Footer, Header} from "../components/index";

const MyApp = ({ Component, pageProps }) => {
  return(
    <div >
      <Header/>
      <Component {...pageProps} />
      <Footer/>
    </div>
  );
}

export default MyApp;
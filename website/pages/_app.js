import "../styles/globals.css"; // or your CSS file path
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
import "@/styles/globals.css";
import {Footer, NavBar} from "../components/index";
//$ things in this file: show in every page
const MyApp = ({ Component, pageProps }) => {
  return(
    <div >
      <NavBar/>
      <Component {...pageProps} />
      <Footer/>
    </div>
  );
}

export default MyApp;
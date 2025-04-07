import React from "react";

//INTERNAL IMPORT
import Style from "./page.module.css";
import NFTDetailsImg from "./NFTDetailsImg/NFTDetailsImg";
import NFTDescription from "./NFTDescription/NFTDescription";

const NFTDetailsPage = () => {
  return (
    <div className={Style.NFTDetailsPage}>
      <NFTDetailsImg />
      <NFTDescription />
    </div>
  );
};

export default NFTDetailsPage;

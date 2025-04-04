import React from "react";

//INTERNAL IMPORT
import { NFTDescription, NFTDetailsImg, NFTTabs } from ".";
import Style from "./NFTDetailsPage.module.css";

const NFTDetailsPage = () => {
  return (
    <div className={Style.NFTDetailsPage}>
      <NFTDetailsImg />
      <NFTDescription />
    </div>
  );
};

export default NFTDetailsPage;

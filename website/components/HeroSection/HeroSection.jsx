import React from "react";

//INTERNAL IMPORT
import Style from "./HeroSection.module.css";
import { Button } from "../index";

const HeroSection = () => {
  return (
    <div className={Style.heroSection}>
      <h1>Discover, collect, and sell NFTs 🖼️</h1>
      <p>
        Discover the most outstanding NTFs in all topics of life. Creative
        your NTFs and sell them
      </p>
      <Button btnName="Start your search" />
    </div>
  );
};

export default HeroSection;
import React from "react";

//INTERNAL IMPORT
import Style from "./Introduction.module.css";
import { Button } from "../index";

const Introduction = () => {
  return (
    <div className={Style.introduction}>
      <h1>Discover, collect, and sell NFTs</h1>
      <p>
        Discover the most outstanding NTFs in all topics of life. Creative
        your NTFs and sell them
      </p>
      <button > Start your search</button>
    </div>
  );
};

export default Introduction;
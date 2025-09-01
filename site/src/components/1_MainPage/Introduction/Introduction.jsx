// src/components/1_MainPage/Introduction/Introduction.jsx
import React from "react";

//INTERNAL IMPORT
import Style from "./Introduction.module.css";
import Button from "../../_Shared/Button/Button";
import Link   from "next/link";

const Introduction = () => {
  return (
    <div className={Style.introduction}>
      <h1>Discover, collect, and sell NFTs</h1>
      <p>
        Discover the most outstanding NTFs in all topics of life. Creative
        your NTFs and sell them
      </p>
        <Button btnName="Start your journey"/>
    </div>
  );
};

export default Introduction;
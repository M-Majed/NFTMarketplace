import React from "react";
import Style from "./Introduction.module.css";

const Introduction = () => {
  return (
    <div className={Style.introduction}>
      <h1>Discover, collect, and sell NFTs</h1>
      <p>
        Discover the most outstanding NTFs in all topics of life. Creative your
        NTFs and sell them
      </p>
      <button type="button" className={Style.button}>
        Start your journey
      </button>
    </div>
  );
};

export default Introduction;

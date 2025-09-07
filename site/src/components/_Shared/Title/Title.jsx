// src/components/_Shared/Title/Title.jsx
import React from "react";
import Style from "./Title.module.css";

const Title = ({ heading, paragraph }) => {
  return (
    <div className={Style.title}>
      <h2>{heading}</h2>
      <p>{paragraph}</p>
    </div>
  );
};

export default Title;

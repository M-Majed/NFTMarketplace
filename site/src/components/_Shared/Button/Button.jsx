// src/components/_Shared/Button/Button.jsx
"use client";
import React from "react";

//INTERNAL IMPORT`
import Style from "./Button.module.css";

export default function Button({ btnName, handleClick = () => {}, icon, classStyle }) {
  return (
    <div className={Style.box}>
      <button
        className={`${Style.button} ${classStyle}`}
        onClick={() => handleClick()}
      >
        {icon} {btnName}
      </button>
    </div>
  );
};
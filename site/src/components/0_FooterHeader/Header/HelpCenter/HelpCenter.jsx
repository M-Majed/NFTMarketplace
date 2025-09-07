// src/components/0_FooterHeader/Header/HelpCenter/HelpCenter.jsx
import React from "react";
import Link from "next/link";
import style from "./HelpCenter.module.css";

const HelpCenter = () => {
  const helpCenter = [
    { name: "About", link: "about" },
    { name: "Contact Us", link: "contact-us" },
    { name: "FAQ", link: "FAQ" },
    { name: "Policies", link: "Policies" },
  ];

  return (
    <div>
      {helpCenter.map((item, index) => (
        <Link
          key={item.name} // ← kept as in original
          href={`/${item.link}`}
          className={style.helpCenter}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default HelpCenter;

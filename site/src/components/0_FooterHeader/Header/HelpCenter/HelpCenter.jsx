import React from 'react'
import Link from 'next/link'
import style from "./HelpCenter.module.css"

const HelpCenter = () => {

  const helpCenter = [
    { name: "About", link: "#" },
    { name: "Contact Us", link: "#" },
    { name: "FAQ", link: "#" },
    { name: "Policies", link: "#" }
  ]

  return (
    <div>
      {helpCenter.map((item) => (
        <Link
          key={item.name}
          href={`/${item.link}`}
          className={style.helpCenter}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default HelpCenter
import React from 'react'
import Link from 'next/link'
import style from "./HelpCenter.module.css"

const HelpCenter = () => {

  const helpCenter = [
    { name: "About", link: "about" },
    { name: "Contact Us", link: "contact-us" },
    { name: "Sign Up", link: "sign-up" },
    { name: "Sign In", link: "sign-in" },
    { name: "Subscription", link: "subscription" }
  ]

  return (
    <div>
      {helpCenter.map((item, index) => (
        <div key={index} className={style.helpCenter}>
          <Link href={{ pathname: `${item.link}` }}>
            {item.name}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default HelpCenter
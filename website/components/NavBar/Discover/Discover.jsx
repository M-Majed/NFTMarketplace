import React from 'react'
//$ for page navigation
import Link from 'next/link'
import style from "./Discover.module.css"

const Discover = () => {

  //$ menus to display in discover
  const discover = [
    { name: "Collections", link: "sollections" },
    { name: "Search", link: "search" },
    { name: "Author Profile", link: "author-profile" },
    { name: "NFT Details", link: "NFT-details" },
    { name: "Account Setting", link: "account-setting" },
    { name: "Connect Wallet", link: "connect-wallet" },
    { name: "Blog", link: "Blog" }
  ]

  return (
    <div>
      {/* //$ return a jsx element for each menu */ }
      {discover.map((item, index) => (
        <div key={index} className={style.discover}>
          {/* //$ Link to navigate to the page */}
          <Link href={{ pathname: `/${item.link}` }}>
            {item.name}
          </Link>
        </div>
      ))}
    </div>
  )
}

export default Discover
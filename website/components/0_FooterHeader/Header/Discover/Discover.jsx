import React from 'react'
import Link from 'next/link'
import style from "./Discover.module.css"

const Discover = () => {

  const discover = [
    { name: "All", link: "marketplace" },
    { name: "Art", link: "marketplace" },
    { name: "Game", link: "marketplace" },
    { name: "Nature", link: "marketplace" },
    { name: "Sport", link: "marketplace" },
    { name: "Portrait", link: "marketplace" },
    { name: "Animal", link: "marketplace" },
    { name: "Memes", link: "marketplace" },
  ]

  return (
    <div>
      {discover.map((item, index) => (
        <Link href={{ pathname: `/${item.link}` }}>
          <div key={index} className={style.discover} >
            {item.name}
          </div>
        </Link>
      ))}
    </div>
  )
}

export default Discover
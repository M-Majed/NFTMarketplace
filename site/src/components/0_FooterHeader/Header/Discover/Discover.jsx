import React from 'react'
import Link from 'next/link'
import style from "./Discover.module.css"

const Discover = () => {

  const discover = [
    { id:1, name: "All", link: "marketplace" },
    { id:2, name: "Art", link: "marketplace" },
    { id:3, name: "Game", link: "marketplace" },
    { id:4, name: "Nature", link: "marketplace" },
    { id:5, name: "Sport", link: "marketplace" },
    { id:6, name: "Portrait", link: "marketplace" },
    { id:7, name: "Animal", link: "marketplace" },
    { id:8, name: "Memes", link: "marketplace" }
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
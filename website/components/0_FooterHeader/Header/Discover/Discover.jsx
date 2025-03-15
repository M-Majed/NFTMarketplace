import React from 'react'
import Link from 'next/link'
import style from "./Discover.module.css"

const Discover = () => {

  const discover = [
    { name: "All", link: "All" },
    { name: "Art", link: "Art" },
    { name: "Game", link: "Game" },
    { name: "Nature", link: "Nature" },
    { name: "Sport", link: "Sport" },
    { name: "Portrait", link: "Portrait" },
    { name: "Animal", link: "Animal" },
    { name: "Memes", link: "Memes" },
  ]

  return (
    <div>
      {discover.map((item, index) => (
        <div key={index} className={style.discover}>
          <Link href={{ pathname: `/${item.link}` }}>
            {item.name}
          </Link>
        </div>
      ))}
    </div>
  )
}

export default Discover
import React from 'react'
import Link from 'next/link'
import style from "./Discover.module.css"

const Discover = () => {

  const discover = [
    { name: "All", link: "marketplace", category: "" },
    { name: "Art", link: "marketplace", category: "Art" },
    { name: "Game", link: "marketplace", category: "Game" },
    { name: "Nature", link: "marketplace", category: "Nature" },
    { name: "Sport", link: "marketplace", category: "Sport" },
    { name: "Portrait", link: "marketplace", category: "Portrait" },
    { name: "Animal", link: "marketplace", category: "Animal" },
  ]

  return (
    <div>
      {discover.map((item, index) => (
       <Link
         key={item.name}
         href={{
           pathname: `/${item.link}`,
           query: item.category ? { category: item.category } : {}
         }}
         className={style.discover}
       >
          {item.name}
        </Link>
      ))}
    </div>
  )
}

export default Discover
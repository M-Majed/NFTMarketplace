import React from 'react'
import Link from 'next/link'
import style from "./Discover.module.css"
import { categories } from "@/app/constants";

const Discover = () => {
  const categoryNames = ["All", ...categories.map(c => c.category)];

  return (
    <div>
      {categoryNames.map((item) => (
        <Link
          key={item}
          href={
            item === "All"
              ? "/marketplace"
              : {
                  pathname: "/marketplace",
                  query: { category: item }
                }
          }
          className={style.discover}
        >
          {item}
        </Link>
      ))}
    </div>
  )
}

export default Discover
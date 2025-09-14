import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { BsCircleFill } from "react-icons/bs";
import Style from "./Category.module.css";
import { categories } from "@/app/constants";

export default function Category({ items }) {
  //$ count NFTs by category
  const countsByCategory = useMemo(() => { //* runs function when items change
    if (!items || !Array.isArray(items)) return {};
    const map = {};
    for (const { name, count } of items) map[name] = count;
    return map;
  }, [items]);

  return (
    <div className={Style.category}>
      <div className={Style.category_title}>
        <h2>categories</h2>
        <p>Explore the categories</p>
      </div>
      <div className={Style.category_categories}>
        {categories.map(({ image, category }) => {
          const count = countsByCategory[category];
          return (
            <Link
              key={category}
              href={{ pathname: "/marketplace", query: { category } }}
              className={Style.category_categories_box}
            >
              <Image
                src={image || "/img/categories/default.jpg"}
                className={Style.category_categories_box_img}
                alt={`${category} background`}
                width={300}
                height={180}
                sizes="(max-width: 560px) 48vw, (max-width: 900px) 33vw, 300px"
              />

              <div className={Style.category_categories_box_title}>
                <span><BsCircleFill /></span>
                <div className={Style.category_categories_box_title_info}>
                  <h4>{category}</h4>
                  {typeof count === "number" && <small>{count} NFTs</small>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

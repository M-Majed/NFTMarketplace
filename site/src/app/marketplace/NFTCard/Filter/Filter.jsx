import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  FaFilter,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import Style from "./Filter.module.css";

const categories = [
  "Art",
  "Game",
  "Nature",
  "Sport",
  "Portrait",
  "Animal",
];

const Filter = ({}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();

  //FUNCTION SECTION
  const openFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 1000) {
      e.target.value = 1000;
    }
  };

const handleCategoryClick = (cat) => {
    // read all existing category params
    const existing = params.getAll('category');
    // compute next set: toggle this cat
    const next = existing.includes(cat)
      ? existing.filter(c => c !== cat)
      : [...existing, cat];
    // rebuild URLSearchParams
    const sp = new URLSearchParams(params.toString());
    sp.delete('category');
    next.forEach(c => sp.append('category', c));
    router.push(`${path}?${sp.toString()}`);
};

  return (
    <div className={Style.filter}>
      <div className={Style.filter_box}>
         <div className={Style.filter_box_left}>
           {categories.map((cat) => {
             const selected = params.getAll('category').includes(cat);
             return (
               <button
                 key={cat}
                onClick={() => handleCategoryClick(cat)}
                 className={[
                   Style.filter_box_left_button,
                   selected ? Style.selected : ""
                 ].join(" ")}
               >
                 {cat}
               </button>
             );
           })}
         </div>
        <div className={Style.filter_box_right}>
          <div className={Style.filter_box_right_box} onClick={() => openFilter()}>
            <FaFilter />
            <span>Filter</span> {filterOpen ? <FaAngleUp /> : <FaAngleDown />}
          </div>
        </div>
      </div>

      {filterOpen && (
        <div className={Style.filter_box_items}>
          <div className={Style.filter_box_items_box}>
            <p>Min price:</p>
            <input
              type="number"
              placeholder="ETH"
              value={minPrice}
              onChange={e => {
                handleInputChange(e);
                setMinPrice(e.target.value);
              }}
            />
            <p>Max price:</p>
            <input
              type="number"
              placeholder="ETH"
              value={maxPrice}
              onChange={e => {
                handleInputChange(e);
                setMaxPrice(e.target.value);
              }}
            />
          </div>
          <button
            className={Style.filter_box_items_button}
            onClick={() => {
              const sp = new URLSearchParams(params.toString());
              if (minPrice) sp.set("minPrice", minPrice);
              else sp.delete("minPrice");
              if (maxPrice) sp.set("maxPrice", maxPrice);
              else sp.delete("maxPrice");
              router.push(`${path}?${sp.toString()}`);
            }}
           >
            Apply Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default Filter;
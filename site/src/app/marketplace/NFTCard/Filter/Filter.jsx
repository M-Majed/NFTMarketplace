import React, { useState } from "react";

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
  "Memes",
];

const Filter = ({
  selectedCategories = [],
  onCategoryClick = () => {},
  onApplyFilter = (_min, _max) => {},
}) => {
  const [filter, setFilter] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  //FUNCTION SECTION
  const openFilter = () => {
    setFilter(!filter);
  };

  const handleInputChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value > 1000) {
      e.target.value = 1000;
    }
  };

const handleCategoryClick = (cat) => {
  setSelectedCategories(prev =>
    prev.includes(cat)
    ? prev.filter(c => c !== cat)
    : [...prev, cat]
  );
};

  return (
    <div className={Style.filter}>
      <div className={Style.filter_box}>
        <div className={Style.filter_box_left}>
         {categories.map(cat => (
           <button
             key={cat}
             onClick={() => onCategoryClick(cat)}
             className={[
               Style.filter_box_left_button,
               selectedCategories.includes(cat) ? Style.selected : ""
             ].join(" ")}
           >
             {cat}
           </button>
         ))}
        </div>
        <div className={Style.filter_box_right}>
          <div className={Style.filter_box_right_box} onClick={() => openFilter()}>
            <FaFilter />
            <span>Filter</span> {filter ? <FaAngleUp /> : <FaAngleDown />}
          </div>
        </div>
      </div>

      {filter && (
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
            onClick={() => onApplyFilter(Number(minPrice), Number(maxPrice))}
          >
            Apply Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default Filter;
import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FaFilter, FaAngleDown, FaAngleUp } from "react-icons/fa";
import Style from "./Filter.module.css";
import { categories } from "@/app/constants";

const Filter = ({}) => {
  const categoryNames = categories.map((c) => c.category);
  const [filterOpen, setFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();

  //$ Toggle filter dropdown
  const openFilter = () => {
    setFilterOpen(!filterOpen);
  };

  //$ validate and set price
  const handleInputChange = (e, setter) => {
    const value = e.target.value;
    if (value === "" || /^(\d+(\.\d{0,18})?|\.\d{0,18})$/.test(value)) {
      //* Removes all characters except digits and decimal point
      setter(value); //* update price if valid input
    }
  };

  //$ Handle price filter
  const handlePriceFilter = () => {
    const sp = new URLSearchParams(params.toString()); //* create new search params object
    if (minPrice) sp.set("minPrice", minPrice); //* set minPrice if exists
    else sp.delete("minPrice"); //* remove minPrice if empty
    if (maxPrice) sp.set("maxPrice", maxPrice);
    else sp.delete("maxPrice");
    router.push(`${path}?${sp.toString()}`); //* push new url with updated prices
  };

  //$ Handle category filter
  const handleCategoryClick = (cat) => {
    const existing = params.getAll("category"); //* current selected categories from url
    const next = existing.includes(cat) //* toggle category
      ? existing.filter((c) => c !== cat)
      : [...existing, cat];
    const sp = new URLSearchParams(params.toString()); //* create new search params object
    sp.delete("category"); //* clear existing categories
    next.forEach((c) => sp.append("category", c)); //* add new categories
    router.push(`${path}?${sp.toString()}`); //* push new url with updated categories
  };

  return (
    <div className={Style.filter}>
      <div className={Style.filter_box}>
        <div className={Style.filter_box_left}>
          {categoryNames.map((cat) => {
            const selected = params.getAll("category").includes(cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={[
                  Style.filter_box_left_button,
                  selected ? Style.selected : "",
                ].join(" ")}>
                {cat}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={Style.filter_box_right_box}
          onClick={openFilter}
          aria-pressed={filterOpen}>
          <FaFilter />
          <span>Filter</span> {filterOpen ? <FaAngleUp /> : <FaAngleDown />}
        </button>
      </div>

      {filterOpen && (
        <div className={Style.filter_box_items}>
          <div className={Style.filter_box_items_box}>
            <p>Min price:</p>
            <input
              type="text"
              placeholder="ETH"
              value={minPrice}
              onChange={(e) => handleInputChange(e, setMinPrice)}
            />
            <p>Max price:</p>
            <input
              type="text"
              placeholder="ETH"
              value={maxPrice}
              onChange={(e) => handleInputChange(e, setMaxPrice)}
            />
          </div>
          <button
            className={Style.filter_box_items_button}
            onClick={() => {
              handlePriceFilter();
            }}>
            Apply Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default Filter;

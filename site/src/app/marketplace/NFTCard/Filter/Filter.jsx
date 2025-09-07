// src/app/marketplace/NFTCard/Filter/Filter.jsx
import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FaFilter, FaAngleDown, FaAngleUp } from "react-icons/fa";
import style from "./Filter.module.css";

const Filter = () => {
  const categories = ["Art", "Game", "Nature", "Sport", "Portrait", "Animal"];

  const [filter_open, set_filter_open] = useState(false);
  const [min_price, set_min_price] = useState("");
  const [max_price, set_max_price] = useState("");

  const router = useRouter();
  const path_name = usePathname();
  const search_params = useSearchParams();

  const toggle_filter = () => set_filter_open(!filter_open);

  const handle_input_change = (e, setter) => {
    const value = e.target.value;
    if (value === "" || /^(\d+(\.\d{0,18})?|\.\d{0,18})$/.test(value)) {
      setter(value);
    }
  };

  const handle_category_click = (cat) => {
    const existing = search_params.getAll("category");
    const next = existing.includes(cat)
      ? existing.filter((c) => c !== cat)
      : [...existing, cat];
    const sp = new URLSearchParams(search_params.toString());
    sp.delete("category");
    next.forEach((c) => sp.append("category", c));
    router.push(`${path_name}?${sp.toString()}`);
  };

  const handle_price_filter = () => {
    const sp = new URLSearchParams(search_params.toString());
    if (min_price) sp.set("minPrice", min_price);
    else sp.delete("minPrice");
    if (max_price) sp.set("maxPrice", max_price);
    else sp.delete("maxPrice");
    router.push(`${path_name}?${sp.toString()}`);
  };

  return (
    <div className={style.filter}>
      <div className={style.filter_box}>
        <div className={style.filter_box_left}>
          {categories.map((cat) => {
            const is_selected = search_params.getAll("category").includes(cat);
            return (
              <button
                key={cat}
                onClick={() => handle_category_click(cat)}
                className={[
                  style.filter_box_left_button,
                  is_selected ? style.selected : "",
                ].join(" ")}>
                {cat}
              </button>
            );
          })}
        </div>
        <div className={style.filter_box_right}>
          <div className={style.filter_box_right_box} onClick={toggle_filter}>
            <FaFilter />
            <span>Filter</span> {filter_open ? <FaAngleUp /> : <FaAngleDown />}
          </div>
        </div>
      </div>

      {filter_open && (
        <div className={style.filter_box_items}>
          <div className={style.filter_box_items_box}>
            <p>Min price:</p>
            <input
              type="text"
              placeholder="ETH"
              value={min_price}
              onChange={(e) => handle_input_change(e, set_min_price)}
            />
            <p>Max price:</p>
            <input
              type="text"
              placeholder="ETH"
              value={max_price}
              onChange={(e) => handle_input_change(e, set_max_price)}
            />
          </div>
          <button
            className={style.filter_box_items_button}
            onClick={handle_price_filter}>
            Apply Filter
          </button>
        </div>
      )}
    </div>
  );
};

export default Filter;

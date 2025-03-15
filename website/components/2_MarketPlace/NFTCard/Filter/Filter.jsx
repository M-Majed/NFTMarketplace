import React, { useState } from "react";
import {
  FaFilter,
  FaAngleDown,
  FaAngleUp,
} from "react-icons/fa";
import Style from "./Filter.module.css";

const Filter = () => {
  const [filter, setFilter] = useState(false);

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

  return (
    <div className={Style.filter}>
      <div className={Style.filter_box}>
        <div className={Style.filter_box_left}>
          <button className={Style.filter_box_left_button} onClick={() => {}}> Art </button>
          <button className={Style.filter_box_left_button} onClick={() => {}}> Game </button>
          <button className={Style.filter_box_left_button} onClick={() => {}}> Nature </button>
          <button className={Style.filter_box_left_button} onClick={() => {}}> Sport </button>
          <button className={Style.filter_box_left_button} onClick={() => {}}> Portrait </button>
          <button className={Style.filter_box_left_button} onClick={() => {}}> Animal </button>
          <button className={Style.filter_box_left_button} onClick={() => {}}> Memes </button>
        </div>
        <div className={Style.filter_box_right}>
          <div className={Style.filter_box_right_box} onClick={() => openFilter()}>
            <FaFilter />
            <span>Filter</span> {filter ? <FaAngleDown /> : <FaAngleUp />}
          </div>
        </div>
      </div>

      {filter && (
        <div className={Style.filter_box_items}>
          <div className={Style.filter_box_items_box}>
            <p>Min price:</p>
            <input type="number" placeholder="ETH" onChange={handleInputChange} />
            <p>Max price:</p>
            <input type="number" placeholder="ETH" onChange={handleInputChange}/>
          </div>
          <button className={Style.filter_box_items_button} onClick={() => {}}> Apply Filter </button>
        </div>
      )}
    </div>
  );
};

export default Filter;
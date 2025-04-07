import React from "react";
import Image from "next/image";
import { BsCircleFill } from "react-icons/bs";

import Style from "./Category.module.css";
import img from "../../../../public/img";
import Title from "../../_Shared/Title/Title";

const Category = () => {
  const CategoryArray = [1, 2, 3, 4, 5, 6];
  return (
    <div className={Style.category}>
      <div className={Style.category_title}>
        <h2>categories</h2>
        <p>Explore the categories</p>
      </div>
      <div className={Style.category_categories}>
        {CategoryArray.map((item, index) => (
          <div className={Style.category_categories_box} key={index}>
            <Image
              src={img.creatorbackground1}
              className={Style.category_categories_box_img}
              alt="Background image"
              width={350}
              height={150}
              objectFit="cover"
            />
            <div className={Style.category_categories_box_title}>
              <span> <BsCircleFill /></span>
              <div className={Style.category_categories_box_title_info}>
                <h4>Enterainment</h4>
                <small>1995 NFTS</small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Category;
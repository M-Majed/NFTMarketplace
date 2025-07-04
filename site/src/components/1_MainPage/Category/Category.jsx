import React from "react";
import Image from "next/image";
import { BsCircleFill } from "react-icons/bs";
import Link from 'next/link';
import Style from "./Category.module.css";
import img from "../../../../public/img";
import Title from "../../_Shared/Title/Title";

const categoryImages = {
  Art:      '/img/categories/art.jpg',
  Game:     '/img/categories/game.jpg',
  Nature:   '/img/categories/nature.webp',
  Sport:    '/img/categories/sport.jpg',
  Portrait: '/img/categories/portrait.jpg',
  Animal:   '/img/categories/animal.jpg',
};

export default function Category({ items }) {
  return (
    <div className={Style.category}>
      <div className={Style.category_title}>
        <h2>categories</h2>
        <p>Explore the categories</p>
      </div>
      <div className={Style.category_categories}>
        {items.map(({ name, count }) => (
          <Link
            key={name}
            href={`/marketplace?category=${encodeURIComponent(name)}`}
            className={Style.category_categories_box}
          >
            <Image
              src={categoryImages[name] || '/img/categories/default.jpg'}
              className={Style.category_categories_box_img}
              alt={`${name} background`}
              width={300}
              height={180}
              objectFit="cover"
            />
            <div className={Style.category_categories_box_title}>
              <span> <BsCircleFill /></span>
              <div className={Style.category_categories_box_title_info}>
                <h4>{name}</h4>
                <small>{count} NFTs</small>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
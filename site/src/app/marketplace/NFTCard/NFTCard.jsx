"use client";
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import React, { useState, useEffect } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { BsImages } from "react-icons/bs";
import Image from "next/image";
import Filter from "./Filter/Filter";
//INTERNAL IMPORT
import Style from "./NFTCard.module.css";
import Title from "../../../components/_Shared/Title/Title";
import img from "../../../../public/img";
import Link from "next/link";

export default function NFTCard({ items, initialCategory = null }) {
  // lift the selected categories into this parent
  const [selectedCats, setSelectedCats] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  
  useEffect(() => {
    if (initialCategory) {
      setSelectedCats([initialCategory]);
    } else {
      setSelectedCats([]);
    }
  }, [initialCategory]);
  // callback passed to Filter
  const handleCategoryToggle = (cat) => {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };
  const handleApplyFilter = (min, max) => {
    setPriceRange({ min, max });
  };

  // compute what to show
  let filtered =
    selectedCats.length > 0
      ? items.filter((l) => selectedCats.includes(l.nft.category))
      : [...items];

  // then apply price filtering if min/max are valid numbers
  const { min, max } = priceRange;
  if (!isNaN(min) && !isNaN(max)) {
    filtered = filtered.filter((l) => l.price >= min && l.price <= max);
  }

  // const [like, setLike] = useState(true);

  // const likeNft = () => {
  //   setLike(!like);
  // };

  return (
    <div className={Style.NFTCard}>
      <Title
        heading="Discover NFTs"
        paragraph="Explore the latest and greatest NFTs"
      />
      {/* tell Filter what’s selected and how to toggle */}
      <Filter
        selectedCategories={selectedCats}
        onCategoryClick={handleCategoryToggle}
        onApplyFilter={handleApplyFilter}
      />

      {filtered.map((listing) => (
        <div className={Style.NFTCard_box} key={listing.id}>
          <Link href={`/nftdetails/${listing.nft.id}`}>
            <div className={Style.NFTCard_box_img}>
              <Image
                src={listing.nft.imageUrl}
                alt={listing.nft.title}
                width={600}
                height={600}
                className={Style.NFTCard_box_img_img}
              />
              <div className={Style.NFTCard_box_overlay}>
                <div className={Style.NFTCard_box_overlay_update}>
                  {/* <div className={Style.NFTCard_box_overlay_update_left}>
                    <div className={Style.NFTCard_box_overlay_update_left_like} onClick={() => likeNft()}>
                      {like ? (<AiOutlineHeart />) : (<AiFillHeart className={Style.NFTCard_box_overlay_update_left_like_icon}/>)}
                      {""} 22
                    </div>
                  </div> */}

                  {/* <div className={Style.NFTCard_box_overlay_update_right}>
                    <p>Remaining time</p>
                    <p>3h : 15m : 20s</p>
                  </div> */}
                </div>

                <div className={Style.NFTCard_box_overlay_update_details}>
                  <div
                    className={Style.NFTCard_box_overlay_update_details_price}>
                    <div
                      className={
                        Style.NFTCard_box_overlay_update_details_price_box
                      }>
                      <h4>{listing.nft.title}</h4>
                      <div
                        className={
                          Style.NFTCard_box_overlay_update_details_price_box_box
                        }>
                        <div
                          className={
                            Style.NFTCard_box_overlay_update_details_price_box_bid
                          }>
                          <small>Price</small>
                          <p>Price: {listing.price} ETH</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={
                      Style.NFTCard_box_overlay_update_details_category
                    }>
                    <BsImages />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

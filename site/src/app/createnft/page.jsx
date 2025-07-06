"use client";
import React, { useState } from "react";
import { MdOutlineAttachFile } from "react-icons/md";
import { FaPercent } from "react-icons/fa";
import { AiTwotonePropertySafety } from "react-icons/ai";
import { TiTick } from "react-icons/ti";
import Image from "next/image";

//INTERNAL IMPORT
import Style from "./page.module.css";
import img from "../../../public/img";
import DropZone from "./DropZone/DropZone";
import Button from "@/components/_Shared/Button/Button";

const createnft = () => {
  const [active, setActive] = useState(0);
  const [file, setFile] = useState(null);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(0);
  const [price, setPrice] = useState(0);

  const handleUpload = async () => {
    if (!file) return alert("Please choose an image first");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemName", itemName);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert("Upload successful!");
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  };

  const categoryArry = [
    {
      image: img.nft_image_1,
      category: "Art",
    },
    {
      image: img.nft_image_2,
      category: "Game",
    },
    {
      image: img.nft_image_3,
      category: "Nature",
    },
    {
      image: img.nft_image_1,
      category: "Sport",
    },
    {
      image: img.nft_image_2,
      category: "Portrait",
    },
    {
      image: img.nft_image_3,
      category: "Animal",
    },
  ];

  return (
    <div className={Style.upload}>
      <DropZone
        onFileSelected={setFile}
        title="JPG, PNG, WEBM , MAX 100MB"
        heading="Drag & drop file"
        subHeading="or Browse media on your device"
        itemName={itemName}
        description={description}
        category={category}
        image={img.upload}
      />

      <div className={Style.upload_box}>
        <div className={Style.upload_box_input}>
          <h2>Item Name</h2>
          <input
            type="text"
            placeholder="shoaib bhai"
            className={Style.upload_box_input_itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
        </div>

        <div className={Style.upload_box_input}>
          <h2>Description</h2>
          <textarea
            rows="5"
            placeholder="something about yourself in few words"
            onChange={(e) => setDescription(e.target.value)}
            className={Style.upload_box_input_description}></textarea>
        </div>

        <div className={Style.upload_box_category}>
          <h2>Choose category</h2>
          <div className={Style.upload_box_slider}>
            {categoryArry.map((el, i) => (
              <div
                className={`${Style.upload_box_slider_item} ${
                  active == i + 1 ? Style.active : ""
                }`}
                key={i + 1}
                onClick={() => (setActive(i + 1), setCategory(el.category))}>
                <div className={Style.upload_box_slider_item_box}>
                  <div className={Style.upload_box_slider_item_box_img}>
                    <Image
                      src={el.image}
                      alt="background image"
                      width={70}
                      height={70}
                      className={Style.upload_box_slider_item_box_img_img}
                    />
                  </div>
                  <div className={Style.upload_box_slider_item_box_img_icon}>
                    <TiTick />
                  </div>
                </div>
                <p>{el.category} </p>
              </div>
            ))}
          </div>
        </div>

        <div className={Style.upload_box_Price}>
          <div className={Style.upload_box_Price_left}>
            <h2>Buyer pays:</h2>
            <input
              type="text"
              className={Style.upload_box_Price_itemPrice}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className={Style.upload_box_Price_right}>
            <h2>You receive:</h2>
            <input type="text" className={Style.upload_box_Price_itemPrice} value={(price * 0.87).toFixed(5)} readOnly />
          </div>
        </div>

        <div className={Style.upload_box_btn}>
          <Button btnName="Create and list NFT" handleClick={handleUpload} />
          <Button btnName="Preview" />
        </div>
      </div>
    </div>
  );
};

export default createnft;

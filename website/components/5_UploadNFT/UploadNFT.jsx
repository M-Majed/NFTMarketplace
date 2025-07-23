import React, { useState } from "react";
import { MdOutlineAttachFile } from "react-icons/md";
import { FaPercent } from "react-icons/fa";
import { AiTwotonePropertySafety } from "react-icons/ai";
import { TiTick } from "react-icons/ti";
import Image from "next/image";

//INTERNAL IMPORT
import Style from "./UploadNFT.module.css";
import images from "../../img";
import { DropZone } from "./index";
import { Button } from "../_Shared";

const UloadNFT = () => {
  const [active, setActive] = useState(0);
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(0);
  const [price, setPrice] = useState(0);

  const categoryArry = [
    {
      image: images.nft_image_1,
      category: "Art",
    },
    {
      image: images.nft_image_2,
      category: "Game",
    },
    {
      image: images.nft_image_3,
      category: "Nature",
    },
    {
      image: images.nft_image_1,
      category: "Sport",
    },
    {
      image: images.nft_image_2,
      category: "Portrait",
    },
    {
      image: images.nft_image_3,
      category: "Animal",
    },
    {
      image: images.nft_image_3,
      category: "Memes",
    },
  ];

  return (
    <div className={Style.upload}>
      <DropZone
        title="JPG, PNG, WEBM , MAX 100MB"
        heading="Drag & drop file"
        subHeading="or Browse media on your device"
        itemName={itemName}
        description={description}
        category={category}
        image={images.upload}
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
            <h2>You receive:</h2>
            <input
              type="text"
              className={Style.upload_box_Price_itemPrice}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className={Style.upload_box_Price_right}>
            <h2>Buyer pays:</h2>
            <input type="text" className={Style.upload_box_Price_itemPrice} />
          </div>
        </div>

        <div className={Style.upload_box_btn}>
          <Button btnName="Upload" />
          <Button btnName="Preview" />
        </div>
      </div>
    </div>
  );
};

export default UloadNFT;

// src/app/createnft/page.jsx
"use client";
import React, { useState, useContext, useEffect } from "react";
import { TiTick } from "react-icons/ti";
import Image from "next/image";
import { useAccount } from "wagmi";
import Style from "./page.module.css";
import img from "@/lib/img";
import DropZone from "./DropZone/DropZone";
import Button from "@/components/_Shared/Button/Button";
import { useRouter } from "next/navigation";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";

const createnft = () => {

  const [active, setActive] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(0);
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState(null);

  const { address, isConnected } = useAccount();
  const { uploadToIPFS, createNFT } = useContext(NFTMarketplaceContext);

  const router = useRouter();

  const handleUpload = async () => {
    if (!isConnected) return alert("Connect your wallet first");
    if (!image) return alert("Please choose an image first");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);
    formData.append("address", address);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await createNFT(name, price, image, description);
      router.push("/");
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  };

  const categoryArry = [
    {
      image: img.Art,
      category: "Art",
    },
    {
      image: img.Game,
      category: "Game",
    },
    {
      image: img.Nature,
      category: "Nature",
    },
    {
      image: img.Sport,
      category: "Sport",
    },
    {
      image: img.Portrait,
      category: "Portrait",
    },
    {
      image: img.Animal,
      category: "Animal",
    },
  ];

  return (
    <div className={Style.upload}>
      <DropZone
        name={name}
        description={description}
        category={category}
        setImage={setImage}
        uploadToIPFS={uploadToIPFS}
      />

      <div className={Style.upload_box}>
        <div className={Style.upload_box_input}>
          <h2>Item Name</h2>
          <input
            type="text"
            placeholder="shoaib bhai"
            className={Style.upload_box_input_itemName}
            onChange={(e) => setName(e.target.value)}
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
            <input
              type="text"
              className={Style.upload_box_Price_itemPrice}
              value={(price * 0.87).toFixed(5)}
              readOnly
            />
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

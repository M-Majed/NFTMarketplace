"use client";
import React, { useState, useContext } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import Style from "./page.module.css";
import DropZone from "./DropZone/DropZone";
import { useRouter } from "next/navigation";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";
import { categories } from "@/app/constants";

const createnft = () => {
  const [active, setActive] = useState(0); //* category active state
  const [name, setName] = useState(""); //* item name
  const [description, setDescription] = useState(""); //* item description
  const [category, setCategory] = useState(0); //* item category
  const [price, setPrice] = useState(""); //* item price
  const [image, setImage] = useState(null); //* item image
  const [isSubmitting, setIsSubmitting] = useState(false); //* form submission state

  const { address, isConnected } = useAccount(); //* user address from wagmi
  const { createSale } = useContext(NFTMarketplaceContext);
  const router = useRouter();

  //$ price validation: only numbers - only one decimal point - no leading zeros unless "0." - update price state
  const handlePriceChange = (e) => {
    let v = e.target.value;
    v = v.replace(/[^\d.]/g, "");
    const firstDot = v.indexOf(".");
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
    }
    if (!v.startsWith("0.") && /^0\d+$/.test(v)) {
      v = v.replace(/^0+/, "");
    }
    setPrice(v);
  };
  //$ Handle form submission - upload metadata to IPFS - create sale on blockchain - save to database - redirect to home
  const handleUpload = async () => {
    //* Prevent multiple submissions - check wallet, image and form fields
    if (isSubmitting) return;
    if (!isConnected) return alert("Connect your wallet first");
    if (!image?.url) return alert("Please choose an image first");
    if (!name || !description || !price)
      return alert("Please fill all required fields");

    try {
      setIsSubmitting(true); //* disable the button
      const res = await fetch("/api/create-nft/create-metadata", {
        //* api route to upload metadata to pinata
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, image: image.url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Metadata creation failed");

      const metadataUrl = data.url;

      //* Create listing on-chain and db
      await createSale(metadataUrl, price, {
        name,
        description,
        imageUrl: image.url,
        metadataUrl,
        width: image.width,
        height: image.height,
        size: image.size,
        price,
        category,
        address,
      });

      router.push("/");
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsSubmitting(false); //* re-enable the button
    }
  };

  return (
    <div className={Style.upload}>
      <div className={Style.upload_box}>
        <DropZone setImage={setImage} />
      </div>

      <div>
        <div className={Style.upload_box_input}>
          <h2>Item Name</h2>
          <input
            type="text"
            placeholder="NFT name"
            className={Style.upload_box_input_itemName}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className={Style.upload_box_input}>
          <h2>Description</h2>
          <textarea
            rows="5"
            placeholder="Exaplain your NFT..."
            onChange={(e) => setDescription(e.target.value)}
            className={Style.upload_box_input_description}></textarea>
        </div>

        <div className={Style.upload_box_category}>
          <h2>Choose category</h2>
          <div className={Style.upload_box_slider}>
            {categories.map((el, i) => (
              <div
                className={`${Style.upload_box_slider_item} ${
                  active == i + 1 ? Style.active : ""
                }`}
                key={i + 1}
                onClick={() => (setActive(i + 1), setCategory(el.category))}>
                <Image
                  src={el.image}
                  alt="background image"
                  width={70}
                  height={70}
                  className={Style.upload_box_slider_item_box_img}
                />
                <p>{el.category} </p>
              </div>
            ))}
          </div>
        </div>

        <div className={Style.upload_box_Price}>
          <h2>Buyer pays:</h2>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            className={Style.upload_box_Price_itemPrice}
            onChange={handlePriceChange}
            value={price}
            placeholder="e.g. 0.05"
          />
        </div>

        <div className={Style.upload_box_btn}>
          <button
            type="button"
            className={Style.button}
            onClick={handleUpload}
            disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Create and list NFT"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default createnft;

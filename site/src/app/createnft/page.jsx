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
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { address, isConnected } = useAccount();
  const { createSale } = useContext(NFTMarketplaceContext);
  const router = useRouter();

  const handlePriceChange = (e) => {
    let v = e.target.value;

    // Only digits and dots
    v = v.replace(/[^\d.]/g, "");

    // Keep only the first dot
    const firstDot = v.indexOf(".");
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
    }

    // Strip leading zeros from integer part unless it's a "0." decimal
    if (!v.startsWith("0.") && /^0\d+$/.test(v)) {
      v = v.replace(/^0+/, "");
    }

    setPrice(v);
  };

  const handleUpload = async () => {
    if (isSubmitting) return;
    if (!isConnected) return alert("Connect your wallet first");
    if (!image?.url) return alert("Please choose an image first"); // Updated check
    if (!name || !description || !price)
      return alert("Please fill all required fields");

    try {
      setIsSubmitting(true);
      // Send to backend for metadata IPFS
      const res = await fetch("/api/create-nft/create-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, image: image.url }), // Use image.url
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Metadata creation failed");

      const metadataUrl = data.url;
      console.log(metadataUrl);

      // Now call createSale on frontend with metadata URL
      const tokenId = await createSale(metadataUrl, price, false, null);
      // Save to database
      const saveRes = await fetch("/api/create-nft/save-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: Number(tokenId),
          name,
          description,
          imageUrl: image.url, // Use image.url
          metadataUrl,
          width: image.width,
          height: image.height,
          size: image.size,
          price,
          category,
          address,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok)
        throw new Error(saveData.error || "Save to database failed");

      router.push("/");
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsSubmitting(false);
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
      <div className={Style.upload_box}>
        <DropZone setImage={setImage} />
      </div>

      <div>
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
          {/* <div className={Style.upload_box_Price_right}>
            <h2>You receive:</h2>
            <input
              type="text"
              className={Style.upload_box_Price_itemPrice}
              value={(price * 0.87).toFixed(5)}
              readOnly
            />
          </div> */}
        </div>

        <div className={Style.upload_box_btn}>
          <Button
            btnName={isSubmitting ? "Processing..." : "Create and list NFT"}
            handleClick={isSubmitting ? undefined : handleUpload}
            disabled={isSubmitting}
            aria-disabled={isSubmitting}
          />{" "}
          {/* <Button btnName="Preview" /> */}
        </div>
      </div>
    </div>
  );
};

export default createnft;

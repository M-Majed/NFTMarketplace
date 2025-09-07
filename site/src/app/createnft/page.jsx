// src/app/createnft/page.jsx
"use client";
import React, { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TiTick } from "react-icons/ti";
import { useAccount } from "wagmi";

import img from "@/lib/img";
import Button from "@/components/_Shared/Button/Button";
import { NFTMarketplaceContext } from "@/context/NFTMarketplaceContext";
import DropZone from "./DropZone/DropZone";
import style from "./page.module.css";

const createnft = () => {
  const [active, set_active] = useState(0);
  const [name, set_name] = useState("");
  const [description, set_description] = useState("");
  const [category, set_category] = useState(0);
  const [price, set_price] = useState("");
  const [image, set_image] = useState(null);
  const [is_submitting, set_is_submitting] = useState(false);

  const { address, isConnected: is_connected } = useAccount();
  const { createSale: create_sale } = useContext(NFTMarketplaceContext);
  const router = useRouter();

  const handle_price_change = (e) => {
    let v = e.target.value;
    v = v.replace(/[^\d.]/g, "");
    const first_dot = v.indexOf(".");
    if (first_dot !== -1) {
      v = v.slice(0, first_dot + 1) + v.slice(first_dot + 1).replace(/\./g, "");
    }
    if (!v.startsWith("0.") && /^0\d+$/.test(v)) {
      v = v.replace(/^0+/, "");
    }
    set_price(v);
  };

  const handle_upload = async () => {
    if (is_submitting) return;
    if (!is_connected) return alert("Connect wallet first");
    if (!image?.url) return alert("Choose an image");
    if (!name || !description || !price) return alert("Fill all fields");

    try {
      set_is_submitting(true);

      const meta_res = await fetch("/api/create-nft/create-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, image: image.url }),
      });
      const meta_data = await meta_res.json();
      if (!meta_res.ok) throw new Error(meta_data.error || "Metadata failed");

      const metadata_url = meta_data.url;

      const token_id = await create_sale(metadata_url, price, false, null);

      const save_res = await fetch("/api/create-nft/save-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: Number(token_id),
          name,
          description,
          imageUrl: image.url,
          metadataUrl: metadata_url,
          width: image.width,
          height: image.height,
          size: image.size,
          price,
          category,
          address,
        }),
      });
      const save_data = await save_res.json();
      if (!save_res.ok) throw new Error(save_data.error || "Save failed");

      router.push("/");
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      set_is_submitting(false);
    }
  };

  const category_list = [
    { image: img.Art, category: "Art" },
    { image: img.Game, category: "Game" },
    { image: img.Nature, category: "Nature" },
    { image: img.Sport, category: "Sport" },
    { image: img.Portrait, category: "Portrait" },
    { image: img.Animal, category: "Animal" },
  ];

  return (
    <div className={style.upload}>
      <div className={style.upload_box}>
        <DropZone setImage={set_image} />
      </div>

      <div>
        <div className={style.upload_box_input}>
          <h2>Item Name</h2>
          <input
            type="text"
            placeholder="name"
            className={style.upload_box_input_itemName}
            onChange={(e) => set_name(e.target.value)}
          />
        </div>

        <div className={style.upload_box_input}>
          <h2>Description</h2>
          <textarea
            rows="5"
            placeholder="describe your NFT"
            onChange={(e) => set_description(e.target.value)}
            className={style.upload_box_input_description}></textarea>
        </div>

        <div className={style.upload_box_category}>
          <h2>Choose category</h2>
          <div className={style.upload_box_slider}>
            {category_list.map((el, i) => (
              <div
                className={`${style.upload_box_slider_item} ${
                  active == i + 1 ? style.active : ""
                }`}
                key={i + 1}
                onClick={() => (set_active(i + 1), set_category(el.category))}>
                <div className={style.upload_box_slider_item_box}>
                  <div className={style.upload_box_slider_item_box_img}>
                    <Image
                      src={el.image}
                      alt="Category"
                      width={70}
                      height={70}
                      className={style.upload_box_slider_item_box_img_img}
                    />
                  </div>
                  <div className={style.upload_box_slider_item_box_img_icon}>
                    <TiTick />
                  </div>
                </div>
                <p>{el.category}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={style.upload_box_Price}>
          <div className={style.upload_box_Price_left}>
            <h2>Buyer pays:</h2>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              className={style.upload_box_Price_itemPrice}
              onChange={handle_price_change}
              value={price}
              placeholder="e.g. 0.05"
            />
          </div>
        </div>

        <div className={style.upload_box_btn}>
          <Button
            btnName={is_submitting ? "Processing..." : "Create and list NFT"}
            handleClick={is_submitting ? undefined : handle_upload}
            disabled={is_submitting}
            aria-disabled={is_submitting}
          />
        </div>
      </div>
    </div>
  );
};

export default createnft;

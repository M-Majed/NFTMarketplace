// src/app/createnft/page.jsx
"use client";
import React, { useState, useContext, useEffect, useRef  } from "react";
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
  const pending = useRef({ imageHash: null, metadataHash: null });
  const committedRef = useRef(false);

  const { address, isConnected } = useAccount();
  const { createSale } = useContext(NFTMarketplaceContext);
  const router = useRouter();

  // If we leave the page before commit, unpin any staged content
  useEffect(() => {
    const cleanup = () => {
      if (committedRef.current) return;
      const hashes = [pending.current.imageHash, pending.current.metadataHash].filter(Boolean);
      if (!hashes.length) return;
      // sendBeacon works while the page is closing
      navigator.sendBeacon(
        "/api/create-nft/unpin",
        JSON.stringify({ hashes })
      );
    };
    window.addEventListener("pagehide", cleanup);
    return () => cleanup();
  }, []);

  // watch the DropZone image.hash
  useEffect(() => {
    if (image?.hash) pending.current.imageHash = image.hash;
  }, [image]);

const handleUpload = async () => {
    if (!isConnected) return alert("Connect your wallet first");
    if (!image?.url || !image?.hash) return alert("Please choose an image first");
    if (!name || !description || !price) return alert("Please fill all required fields");

    try {
      // Send to backend for metadata IPFS
      const res = await fetch("/api/create-nft/create-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, image: image.url }), // Use image.url
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Metadata creation failed");

      const metadataUrl = data.url;
      const metadataHash = data.hash;
      pending.current.metadataHash = metadataHash;
      console.log(metadataUrl);

      // Now call createSale on frontend with metadata URL
      const { tokenId, txHash } = await createSale(metadataUrl, price, false, null);
      committedRef.current = true; // from here on, never unpin
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
        txHash,
        imageHash: image.hash,
        metadataHash,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok)
        throw new Error(saveData.error || "Save to database failed");

      router.push("/");
    } catch (err) {
    // If we failed before commit, clean up pins now (in addition to pagehide safety)
    if (!committedRef.current) {
      try {
        await fetch("/api/create-nft/unpin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({
            hashes: [pending.current.imageHash, pending.current.metadataHash].filter(Boolean),
          }),
        });
      } catch {}
    }
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
      <DropZone setImage={setImage} />

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

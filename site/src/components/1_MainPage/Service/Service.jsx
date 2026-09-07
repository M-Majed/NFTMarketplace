"use client";
import React from "react";
import Image from "next/image";
import Style from "./Service.module.css";
import img from "@/lib/img";

const Service = () => {
  const TEST_KEYS = [
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
    "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  ];

  // Truncate keys
  const truncate = (s) =>
    s.length <= 7 + 7 ? s : `${s.slice(0, 7)}…${s.slice(-7, s.length)}`;

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={Style.service}>
      <div className={Style.service_box}>
        <div className={Style.service_box_item}>
          <Image
            src={img.service1}
            alt="Filter & Discover"
            width={100}
            height={100}
          />
          <p className={Style.service_box_item_step}>
            <span>Step 1</span>
          </p>
          <h3>Install metamask</h3>
          <p>Install MetaMask from the Chrome Web Store.</p>
        </div>
        <div className={Style.service_box_item}>
          <Image
            src={img.service2}
            alt="Filter & Discover"
            width={100}
            height={100}
          />
          <p className={Style.service_box_item_step}>
            <span>Step 2</span>
          </p>
          <h3>Add testnet to metamask</h3>
          <p>
            Open MetaMask → Networks <br />
            → Add custom network. Add data: <br />
            http:// Xxx.xxx.xxx.xxx:8545
            <br />
            chain id 1337
            <br />
            symbol ETH
          </p>
        </div>
        <div className={Style.service_box_item}>
          <Image
            src={img.service3}
            alt="Connect Wallet"
            width={100}
            height={100}
          />
          <p className={Style.service_box_item_step}>
            <span>Step 3</span>
          </p>
          <h3>add wallet via private key</h3>
          <div className={Style.secrets}>
            {TEST_KEYS.map((pk, i) => (
              <div key={i} className={Style.secret_row}>
                <span className={Style.secret_label}>Account {i + 1}</span>
                <span className={Style.secret_value} title={pk}>
                  {truncate(pk)}
                </span>
                <button
                  type="button"
                  className={Style.copy_btn}
                  onClick={() => copy(pk)}
                  aria-label={`Copy private key for account ${i + 1}`}>
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className={Style.service_box_item}>
          <Image
            src={img.service4}
            alt="Filter & Discover"
            width={100}
            height={100}
          />
          <p className={Style.service_box_item_step}>
            <span>Step 4</span>
          </p>
          <h3>Enjoy</h3>
          <p>connect via provided wallets and start buying and selling NFTs</p>
        </div>
      </div>
    </div>
  );
};

export default Service;

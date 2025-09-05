// src/components/0_FooterHeader/Footer/Footer.jsx
import React from "react";
import Image from "next/image";
import {
  TiSocialFacebook,
  TiSocialLinkedin,
  TiSocialTwitter,
  TiSocialYoutube,
  TiSocialInstagram,
} from "react-icons/ti";
import { RiSendPlaneFill } from "react-icons/ri";

import style from "./Footer.module.css";
import img from "@/lib/img";

const Footer = () => {
  return (
    <footer className={style.footer} role="contentinfo">
      <div className={style.footer_box}>
        <div className={style.footer_box_social}>
          <Image
            src={img.logo}
            alt="Site logo"
            height={100}
            width={100}
            sizes="(max-width: 900px) 80px, 100px"
            priority
          />

          <p>
            The world’s first and largest digital marketplace for crypto
            collectibles and non-fungible tokens (NFTs). Buy, sell, and discover
            exclusive digital items.
          </p>

          <div className={style.footer_social}>
            <a href="#" aria-label="Facebook">
              <TiSocialFacebook />
            </a>
            <a href="#" aria-label="LinkedIn">
              <TiSocialLinkedin />
            </a>
            <a href="#" aria-label="Twitter">
              <TiSocialTwitter />
            </a>
            <a href="#" aria-label="YouTube">
              <TiSocialYoutube />
            </a>
            <a href="#" aria-label="Instagram">
              <TiSocialInstagram />
            </a>
          </div>
        </div>

        <div className={style.subscribe}>
          <h3>Subscribe</h3>

          <div className={style.subscribe_box}>
            <input
              type="email"
              placeholder="Enter your email *"
              aria-label="Email address"
              autoComplete="email"
            />
            <button
              type="button"
              className={style.subscribe_box_button}
              aria-label="Submit email"
            >
              <RiSendPlaneFill />
            </button>
          </div>

          <div className={style.subscribe_box_info}>
            <p>
              Discover, collect, and sell extraordinary NFTs. OpenSea is the
              world’s first and largest NFT marketplace.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

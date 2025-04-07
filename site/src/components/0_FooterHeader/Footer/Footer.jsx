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
import img from "../../../../public/img"

const Footer = () => {
  return (
    <div className={style.footer}>
      <div className={style.footer_box}>
        <div className={style.footer_box_social}>
          <Image src={img.logo} alt="footer logo" height={100} width={100} />
          <p>
            The world’s first and largest digital marketplace for crypto
            collectibles and non-fungible tokens (NFTs). Buy, sell, and discover
            exclusive digital items.
          </p>

          <div className={style.footer_social}>
            <a href="#">
              <TiSocialFacebook />
            </a>
            <a href="#">
              <TiSocialLinkedin />
            </a>
            <a href="#">
              <TiSocialTwitter />
            </a>
            <a href="#">
              <TiSocialYoutube />
            </a>
            <a href="#">
              <TiSocialInstagram />
            </a>
          </div>
        </div>
        

        <div className={style.subscribe}>
          <h3>Subscribe</h3>

          <div className={style.subscribe_box}>
            <input type="email" placeholder="Enter your email *" />
            <RiSendPlaneFill className={style.subscribe_box_send} />
          </div>
          <div className={style.subscribe_box_info}>
            <p>
              Discover, collect, and sell extraordinary NFTs OpenSea is the
              world first and largest NFT marketplace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
'use client'
import React, { useState } from "react";
import Image from "next/image";
import {
  MdVerified,
  MdCloudUpload,
  MdReportProblem,
  MdOutlineDeleteSweep,
} from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import {
  TiSocialFacebook,
  TiSocialLinkedin,
  TiSocialTwitter,
  TiSocialYoutube,
  TiSocialInstagram,
} from "react-icons/ti";

//INTERNAL IMPORT
import Style from "./NFTDescription.module.css";
import img from "../../../../public/img";

const NFTDescription = () => {
  const [social, setSocial] = useState(false);
  const [NFTMenu, setNFTMenu] = useState(false);
  const [owner, setOwner] = useState(false);


  const openSocial = () => {
    setSocial(!social);
    setNFTMenu(false);
  };

  const openNFTMenu = () => {
    setNFTMenu(!NFTMenu);
    setSocial(false);
  };

  return (
    <div className={Style.NFTDescription}>
      <div className={Style.NFTDescription_share}>
        <div className={Style.NFTDescription_share_box}>
          <MdCloudUpload
            className={Style.NFTDescription_share_box_icon}
            onClick={() => openSocial()}
          />
          {social && (
            <div className={Style.NFTDescription_share_box_social}>
              <a href="#">
                <TiSocialFacebook /> Facebook
              </a>
              <a href="#">
                <TiSocialInstagram /> Instragram
              </a>
              <a href="#">
                <TiSocialLinkedin /> LinkedIn
              </a>
              <a href="#">
                <TiSocialTwitter /> Twitter
              </a>
              <a href="#">
                <TiSocialYoutube /> YouTube
              </a>
            </div>
          )}

          <BsThreeDots
            className={Style.NFTDescription_share_box_icon}
            onClick={() => openNFTMenu()}
          />

          {NFTMenu && (
            <div className={Style.NFTDescription_share_box_social}>
              <a href="#">
                <MdReportProblem /> Report
              </a>
              <a href="#">
                <MdOutlineDeleteSweep /> Add to WishList
              </a>
            </div>
          )}
        </div>
      </div>
      {/* //Part TWO */}
      <div className={Style.NFTDescription_profile}>
        <h1>BearX #23453</h1>
        <div className={Style.NFTDescription_profile_box}>
          <Image
            src={img.user1}
            alt="profile"
            width={40}
            height={40}
            className={Style.NFTDescription_profile_box_img}
          />
          <div className={Style.NFTDescription_profile_box_info}>
            <small>Creator</small> <br />
            <span>
              Karli Costa <MdVerified />
            </span>
          </div>
        </div>

        <div className={Style.NFTDescription_profile_biding}>
          <div className={Style.NFTDescription_profile_biding_box_price}>
            <small>Price</small>
            <p>
              1.000 ETH <span>( ≈ $3,221.22)</span>
            </p>
          </div>

          <div className={Style.NFTDescription_profile_biding_box_buttons}>
            <button
              handleClick={() => {}}
              className={Style.NFTDescription_profile_biding_box_buttons_button}
            >
              {" "}
              Buy Now{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDescription;

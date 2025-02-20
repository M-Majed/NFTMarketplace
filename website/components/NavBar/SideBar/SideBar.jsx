//$ Sidebar is only for phone view

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { GrClose } from "react-icons/gr";
import {
  TiSocialFacebook,
  TiSocialLinkedin,
  TiSocialTwitter,
  TiSocialYoutube,
  TiSocialInstagram,
  TiArrowSortedDown,
  TiArrowSortedUp,
} from "react-icons/ti";
import style from "./SideBar.module.css";
import img from "../../../img";
import Button from "../../Button/Button";

//$ setOpenSideMenu: props received from NavBar.jsx to control the sidebar
//* for GrClose btn
const SideBar = ({ setOpenSideMenu }) => {
  //$ Which menu is open
  const [openDiscover, setOpenDiscover] = useState(false);
  const [openHelp, setOpenHelp] = useState(false);
  //$ menus to display in discover
  const discover = [
    { name: "Collection", link: "collection" },
    { name: "Search", link: "search" },
    { name: "Author Profile", link: "author-profile" },
    { name: "NFT Details", link: "NFT-details" },
    { name: "Account Setting", link: "account-setting" },
    { name: "Connect Wallet", link: "connect-wallet" },
    { name: "Blog", link: "blog" },
  ];
  //$ menus to display in Help Center
  const helpCenter = [
    { name: "About", link: "about" }, 
    { name: "Contact Us", link: "contact-us" },
    { name: "Sign Up", link: "sign-up" }, 
    { name: "Sign In", link: "sign-in" }, 
    { name: "Subscription", link: "subscription" }
  ];

  const openDiscoverMenu = () => {
    setOpenDiscover(!openDiscover);
  };

  const openHelpMenu = () => {
    setOpenHelp(!openHelp);
  };

  const closeSideBar = () => {
    setOpenSideMenu(false);
  };

  return (
    <div className={style.sideBar}>
      <GrClose className={style.sideBar_closeBtn} onClick={() => closeSideBar()}/>

      <div className={style.sideBar_box}>
        <Image src={img.logo} alt="logo" width={150} height={150} />
        <p>
          Discover the most outstanding articles on all topices of NFT & write
          your own stories and share them
        </p>

        <div className={style.sideBar_social}>
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

      <div className={style.sideBar_menu}>
        <div>
          <div className={style.sideBar_menu_box} onClick={() => openDiscoverMenu()}>
            <p>Discover</p>
            <TiArrowSortedDown />
          </div>

          {openDiscover && (
            <div className={style.sideBar_discover}>
              {discover.map((item, index) => (
                <p key={index}>
                  <Link href={{ pathname: `${item.link}` }}>
                    {item.name}
                  </Link>
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className={style.sideBar_menu_box} onClick={() => openHelpMenu()}>
            <p>Help Center</p>
            <TiArrowSortedDown />
          </div>

          {openHelp && (
            <div className={style.sideBar_discover}>
              {helpCenter.map((item, index) => (
                <p key={index}>
                  <Link href={{ pathname: `${item.link}` }}>
                    {item.name}
                  </Link>
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={style.sideBar_button}>
        <Button btnName="Create" handleClick={() => {}} />
        <Button btnName="Connect Wallet" handleClick={() => {}} />
      </div>
    </div>
  );
};

export default SideBar;
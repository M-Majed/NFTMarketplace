import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdNotifications } from "react-icons/md";
import { BsSearch } from "react-icons/bs";
import { CgMenuLeft, CgMenuRight } from "react-icons/cg";

import Style from "./NavBar.module.css";
import { Discover, HelpCenter, Notification, Profile, SideBar } from "./index";
import { Button } from "../index";
import img from "../../img";

const NavBar = () => {
  //$ Which menu is open
  const [discover, setDiscover] = useState(false);
  const [help, setHelp] = useState(false);
  const [notification, setNotification] = useState(false);
  const [profile, setProfile] = useState(false);
  const [openSideMenu, setOpenSideMenu] = useState(false);

  //$ open menu with text
  const openMenu = (e) => {
    const btnText = e.target.innerText;
    if (btnText == "Discover") {
      setDiscover(!discover);
      setHelp(false);
      setNotification(false);
      setProfile(false);
    } else if (btnText == "Help Center") {
      setDiscover(false);
      setHelp(!help);
      setNotification(false);
      setProfile(false);
    } else {
      setDiscover(false);
      setHelp(false);
      setNotification(false);
      setProfile(false);
    }
  };

  //$ open notification menu
  const openNotification = () => {
    if (!notification) {
      setNotification(true);
      setDiscover(false);
      setHelp(false);
      setProfile(false);
    } else {
      setNotification(false);
    }
  };

  //$ open profile menu
  const openProfile = () => {
    if (!profile) {
      setProfile(true);
      setHelp(false);
      setDiscover(false);
      setNotification(false);
    } else {
      setProfile(false);
    }
  };

  const openSideBar = () => {
    setOpenSideMenu(!openSideMenu);
  };

  return (
    <div className={Style.navbar}>
      <div className={Style.navbar_container}>

          {/* //$ Left section */}
          <div className={Style.navbar_container_left}>
            <div className={Style.logo}>
              <Image
                className={Style.logo}
                src={img.logo}
                alt="NFT MARKET PLACE"
              />
            </div>
            <div className={Style.navbar_container_left_box_input}>
              <div className={Style.navbar_container_left_box_input_box}>
                <input type="text" placeholder="Search NFT" />
                <BsSearch onClick={() => {}} className={Style.search_icon} />
              </div>
            </div>
          </div>

          {/* //$ Right section */}
          <div className={Style.navbar_container_right}>
            
            {/*//$ Discover  */}
            <div className={Style.navbar_container_right_discover}>
              <p onClick={(e) => openMenu(e)}>Discover</p>
              {/* //* Render Discover if discover is true */}
              {discover && (
              <div className={Style.navbar_container_right_discover_box}>
                <Discover />
              </div>
              )}
            </div>

            {/* //$ HelpCenter */}
            <div className={Style.navbar_container_right_help}>
              <p onClick={(e) => openMenu(e)}>Help Center</p>
              {help && (
                <div className={Style.navbar_container_right_help_box}>
                  <HelpCenter />
                </div>
              )}
            </div>

            {/* //$ Notification */}
            <div className={Style.navbar_container_right_notify}>
              <MdNotifications className={Style.notify} onClick={() => openNotification()}/>
              {notification && <Notification />}
            </div>

            {/* //$ Btn section*/}
            <div className={Style.navbar_container_right_button}>
              <Button btnName="Create" handleClick={() => {}} />
            </div>

            {/* //$ Profile section */}
            <div className={Style.navbar_container_right_profile_box}>
              <div className={Style.navbar_container_right_profile}>
                <Image
                  src={img.user1}
                  className={Style.profileImg}
                  alt="Profile"
                  onClick={() => openProfile()}
                />
                {profile && <Profile />}
              </div>
            </div>

            {/* //$ MENU BUTTON */}
            <div className={Style.navbar_container_right_menuBtn}>
              <CgMenuRight className={Style.menuIcon} onClick={() => openSideBar()}
              />
            </div>

        </div>
      </div>

      {/* //$ Sidebar */}
      {openSideMenu && (
        <div className={Style.sideBar}>
          {/* //$ setOpenSideMenu is passed so sidebar component can control state of openSideMenu */}
          <SideBar setOpenSideMenu={setOpenSideMenu} />
        </div>
      )}
    </div>
  );
};

export default NavBar;
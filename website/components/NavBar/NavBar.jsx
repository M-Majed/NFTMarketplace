import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdNotifications } from "react-icons/md";
import { BsSearch } from "react-icons/bs";
import { CgMenuLeft, CgMenuRight } from "react-icons/cg";

import style from "./NavBar.module.css";
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
      setOpenSideMenu(false);
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
      setOpenSideMenu(false);
    } else {
      setProfile(false);
    }
  };

  const openSideBar = () => {
    setOpenSideMenu(!openSideMenu);
    setProfile(false);
    setNotification(false);
  };

  return (
    <div className={style.navbar}>
      <div className={style.navbar_container}>

          {/* //$ Left section */}
          <div className={style.navbar_container_left}>
            {/* //$ Logo */}
            <Link href="/">
              <div className={style.logo}>
                <Image
                  className={style.logo}
                  src={img.logo}
                  alt="NFT MARKET PLACE"
                />
              </div>
            </Link>
            {/* //$ Search */}
            <div className={style.navbar_container_left_box_input}>
              <div className={style.navbar_container_left_box_input_box}>
                <input type="text" placeholder="Search NFT" />
                <BsSearch onClick={() => {}} className={style.search_icon} />
              </div>
            </div>
          </div>

          {/* //$ Right section */}
          <div className={style.navbar_container_right}>
            
            {/*//$ Discover  */}
            <div className={style.navbar_container_right_discover}  onClick={(e) => openMenu(e)}>
              <p>Discover</p>
              {/* //* Render Discover if discover is true */}
              {discover && (
              <div className={style.navbar_container_right_discover_box}>
                <Discover />
              </div>
              )}
            </div>

            {/* //$ HelpCenter */}
            <div className={style.navbar_container_right_help}  onClick={(e) => openMenu(e)}>
              <p>Help Center</p>
              {help && (
                <div className={style.navbar_container_right_help_box}>
                  <HelpCenter />
                </div>
              )}
            </div>

            {/* //$ Notification */}
            <div className={style.navbar_container_right_notify} onClick={() => openNotification()}>
              <MdNotifications className={style.notify}/>
              {notification && (
                <div className={style.navbar_container_right_notification_box}>
                  <Notification />
                </div>
              )}
            </div>

            {/* //$ Btn section*/}
            <div className={style.navbar_container_right_button}>
              <Button btnName="Create" handleClick={() => {}} />
            </div>

            {/* //$ Profile section */}
            <div className={style.navbar_container_right_profile}>
              <Image
                src={img.user1}
                className={style.profileImg}
                alt="Profile"
                onClick={() => openProfile()}
              />
              {profile && (
                <div className={style.navbar_container_right_profile_box}>
                  <Profile />
                </div>
              )}
            </div>

            {/* //$ MENU BUTTON */}
            <div className={style.navbar_container_right_menuBtn}>
            {openSideMenu ? (
                    <CgMenuLeft onClick={() => openSideBar()} />
                    ) : (
                    <CgMenuRight onClick={() => openSideBar()} />
                    )}
            </div>

        </div>
      </div>

      {/* //$ Sidebar */}
      {openSideMenu && (
        <div className={style.sideBar}>
          {/* //$ setOpenSideMenu is passed so sidebar component can control state of openSideMenu */}
          <SideBar setOpenSideMenu={setOpenSideMenu} />
        </div>
      )}
    </div>
  );
};

export default NavBar;
'use client'

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdNotifications } from "react-icons/md";
import { BsSearch } from "react-icons/bs";
import style from "./Header.module.css";
import img from "../../../../public/img"
import Discover from "./Discover/Discover";
import HelpCenter from "./HelpCenter/HelpCenter";
import Notification from "./Notification/Notification";
import Profile from "./Profile/Profile";

const Header = () => {
  const [discover, setDiscover] = useState(false);
  const [help, setHelp] = useState(false);
  const [notification, setNotification] = useState(false);
  const [profile, setProfile] = useState(false);

  const discoverRef = useRef();
  const helpRef = useRef();
  const notificationRef = useRef();
  const profileRef = useRef();

  const openNotification = () => {
    setNotification(!notification);
    setDiscover(false);
    setHelp(false);
    setProfile(false);
  };

  const openProfile = () => {
    setProfile(!profile);
    setDiscover(false);
    setHelp(false);
    setNotification(false);
  };

  return (
    <div className={style.header}>
      <div className={style.header_container_left}>
        <Link href="/">
          <div className={style.header_container_left_logo}>
            <Image
              className={style.logo}
              src={img.logo}
              alt="NFT MARKET PLACE"
            />
          </div>
        </Link>
        <div className={style.header_container_left_box_input}>
          <input type="text" placeholder="Search NFT" />
          <button className={style.header_container_left_searchbtn}>
            <BsSearch onClick={() => {}} />
          </button>
        </div>
      </div>

      <div className={style.header_container_right}>
        <div
          ref={discoverRef}
          className={style.header_container_right_discover}
          onMouseEnter={() => setDiscover(true)}
          onMouseLeave={() => setDiscover(false)}
        >
          <p>Discover</p>
          {discover && (
            <div className={style.header_container_right_discover_box}>
              <Discover />
            </div>
          )}
        </div>

        <div
          ref={helpRef}
          className={style.header_container_right_help}
          onMouseEnter={() => setHelp(true)}
          onMouseLeave={() => setHelp(false)}
        >
          <p>Help Center</p>
          {help && (
            <div className={style.header_container_right_help_box}>
              <HelpCenter />
            </div>
          )}
        </div>

        <div
          ref={notificationRef}
          className={style.header_container_right_notification}
          onClick={openNotification}
        >
          <MdNotifications
            className={style.header_container_right_notification_icon}
          />
          {notification && (
            <div className={style.header_container_right_notification_box}>
              <Notification />
            </div>
          )}
        </div>

        <div ref={profileRef} className={style.header_container_right_profile}>
          <Image
            src={img.user1}
            className={style.header_container_right_profileImg}
            alt="Profile"
            onClick={openProfile}
          />
          {profile && (
            <div className={style.header_container_right_profile_box}>
              <Profile />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;

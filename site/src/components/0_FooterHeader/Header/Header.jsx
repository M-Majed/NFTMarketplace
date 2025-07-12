"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { MdNotifications } from "react-icons/md";
import { BsSearch } from "react-icons/bs";
import style from "./Header.module.css";
import img from "../../../../public/img";
import Discover from "./Discover/Discover";
import HelpCenter from "./HelpCenter/HelpCenter";
import Notification from "./Notification/Notification";
import Profile from "./Profile/Profile";
import { useRouter } from "next/navigation";

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [discover, setDiscover] = useState(false);
  const [help, setHelp] = useState(false);
  const [notification, setNotification] = useState(false);
  const [profile, setProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();
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

  const handleSearch = () => {
    const term = searchTerm.trim();
    if (term) {
      // only add the query when non-empty
      router.push(`/marketplace?search=${encodeURIComponent(term)}`);
    } else {
      // blank search → show all listings
      router.push("/marketplace");
    }
  };

  return (
    <div className={style.header}>
      <div className={style.header_container_left}>
        <Link href="/">
          <div className={style.header_container_left_logo}>
            <Image
              className={style.logo}
              src={img.logo}
              alt="NFT MARKETPLACE"
            />
          </div>
        </Link>
        <div className={style.header_container_left_box_input}>
          <input
            type="text"
            placeholder="Search NFT"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            className={style.header_container_left_searchbtn}
            onClick={handleSearch}>
            <BsSearch />
          </button>
        </div>
      </div>

      <div className={style.header_container_right}>
        <Link href={`/createnft`}>
          <button className={style.header_container_right_createNFT}>
            {" "}
            Create NFT{" "}
          </button>
        </Link>
        <div
          ref={discoverRef}
          className={style.header_container_right_discover}
          onMouseEnter={() => setDiscover(true)}
          onMouseLeave={() => setDiscover(false)}>
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
          onMouseLeave={() => setHelp(false)}>
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
          onClick={openNotification}>
          <MdNotifications
            className={style.header_container_right_notification_icon}
          />
          {notification && (
            <div className={style.header_container_right_notification_box}>
              <Notification />
            </div>
          )}
        </div>

       {isLoggedIn ? (
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
       ) : (
         <button
           className={style.header_container_right_createNFT}
           onClick={() => {
             /* future hook: open wallet modal */
             console.log("Sign In clicked");
           }}
         >
           Sign In
         </button>
       )}
      </div>
    </div>
  );
};

export default Header;

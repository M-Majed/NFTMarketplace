import React from "react";
import { FaUserAlt, FaRegImage, FaUserEdit } from "react-icons/fa";
import { MdHelpCenter } from "react-icons/md";
import { TbDownloadOff, TbDownload } from "react-icons/tb";
import Link from "next/link";
import style from "./Profile.module.css";

const Profile = () => {
  return (
    <div className={style.profile}>
      <div className={style.profile_info}>
        <p>MRMTFW</p>
        <small>X038499382920203...</small>
      </div>

      <div className={style.profile_menu}>
        <Link href={{ pathname: "/profile" }}>
          <div className={style.profile_menu_item}>
            <FaUserAlt />
            <p>My Profile</p>
          </div>
        </Link>
        <Link href={{ pathname: "/my-items" }}>
          <div className={style.profile_menu_item}>
            <FaRegImage />
            <p>My Items</p>
          </div>
        </Link>
        <Link href={{ pathname: "/logout" }}>
          <div className={style.profile_menu_item}>            <TbDownload />
            <p>Logout</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Profile;

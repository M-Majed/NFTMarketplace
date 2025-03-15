import React from 'react'
import { FaUserAlt, FaRegImage, FaUserEdit } from "react-icons/fa";
import { MdHelpCenter } from "react-icons/md";
import { TbDownloadOff, TbDownload } from "react-icons/tb";
import Link from "next/link";
import style from "./Profile.module.css"

const Profile = () => {
  return (
    <div className={style.profile}>
      <div className={style.profile_info}>
        <p>MRMTFW</p>
        <small>X038499382920203...</small>
      </div>

      <div className={style.profile_menu}>
        <div className={style.profile_menu_item}>
          <FaUserAlt />
          <p>
            <Link href={{ pathname: "/my-profile" }}>My Profile</Link>
          </p>
        </div>
        <div className={style.profile_menu_item}>
          <FaRegImage />
          <p>
            <Link href={{ pathname: "/my-items" }}>My Items</Link>
          </p>
        </div>
        <div className={style.profile_menu_item}>
          <TbDownload />
          <p>
            <Link href={{ pathname: "/logout" }}>Logout</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile
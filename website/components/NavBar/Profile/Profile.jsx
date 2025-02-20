import React from 'react'
import { FaUserAlt, FaRegImage, FaUserEdit } from "react-icons/fa";
import { MdHelpCenter } from "react-icons/md";
import { TbDownloadOff, TbDownload } from "react-icons/tb";
import Link from "next/link";
import style from "./Profile.module.css"

const Profile = () => {
  return (
    <div className={style.profile}>
      <div className={style.profile_account}>

        <div className={style.profile_account_info}>
          <p>MRMTFW</p>
          <small>X038499382920203...</small>
        </div>
      </div>

      <div className={style.profile_menu}>
        <div className={style.profile_menu_one}>
          <div className={style.profile_menu_one_item}>
            <FaUserAlt />
            <p>
              <Link href={{ pathname: "/myprofile" }}>My Profile</Link>
            </p>
          </div>
          <div className={style.profile_menu_one_item}>
            <FaRegImage />
            <p>
              <Link href={{ pathname: "/my-items" }}>My Items</Link>
            </p>
          </div>
          <div className={style.profile_menu_one_item}>
            <FaUserEdit />
            <p>
              <Link href={{ pathname: "/edit-profile" }}>Edit Profile</Link>
            </p>
          </div>
        </div>

        <div className={style.profile_menu_two}>
          <div className={style.profile_menu_one_item}>
            <MdHelpCenter />
            <p>
              <Link href={{ pathname: "/help" }}>Help</Link>
            </p>
          </div>
          <div className={style.profile_menu_one_item}>
            <TbDownload />
            <p>
              <Link href={{ pathname: "/disconnet" }}>Disconnet</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile
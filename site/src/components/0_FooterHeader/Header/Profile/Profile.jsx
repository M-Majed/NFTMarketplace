import React from "react";
import { FaUserAlt, FaRegImage, FaUserEdit } from "react-icons/fa";
import { MdHelpCenter } from "react-icons/md";
import { TbDownloadOff, TbDownload } from "react-icons/tb";
import Link from "next/link";
import style from "./Profile.module.css";

const Profile = ({ address, onLogout }) => {
  const short = address
  ? `${address.slice(0, 6)}...${address.slice(-4)}`
  : "";
  return (
    <div className={style.profile}>
      <div className={style.profile_info}>
        <p>{short}</p>
        <small>{address}</small>
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
          <div className={style.profile_menu_item} onClick={onLogout}>
            <TbDownload />
            <p>Logout</p>
          </div>
      </div>
    </div>
  );
};

export default Profile;

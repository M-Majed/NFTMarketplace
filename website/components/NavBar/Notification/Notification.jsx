import React from 'react'
//$ better performance than default html img 
import Image from 'next/image'
import style from "./Notification.module.css"
import img from "../../../img"

const Notification = () => {
  return (
  <div className={style.notification}>
    <div className={style.notification_box}>
      <div className={style.notification_box_img}>
        <Image
          src={img.user1}
          alt="profile image"
          className={style.notification_box_img}
        />
      </div>
      <div className={style.notification_box_info}>
        <h4 className={style.notification_box_h4}>MRMTFW</h4>
        <p className={style.notification_box_paragraph}>Measure action your user...</p>
        <small>3 minutes ago</small>
      </div>
      {/* //$ to show new notification */}
      <span className={style.notification_box_new}></span>
    </div>
  </div>
  )
}

export default Notification
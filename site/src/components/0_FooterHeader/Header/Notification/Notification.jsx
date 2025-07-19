import React from 'react'
//$ better performance than default html img 
import Image from 'next/image'
import style from "./Notification.module.css"
import img from '@/lib/img'

const Notification = () => {
  return (
  <div className={style.notifications}>
    <div className={style.notifications_box}>
      <div className={style.notifications_box_img}>
        <Image
          src={img.user1}
          alt="profile image"
          className={style.notifications_box_img}
        />
      </div>
      <div className={style.notifications_box_info}>
        <h4 className={style.notifications_box_sender}>MRMTFW</h4>
        <p className={style.notifications_box_paragraph}>Measure action your user...</p>
        <small>3 minutes ago</small>
      </div>
    </div>
  </div>
  )
}

export default Notification
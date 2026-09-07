"use client";
import React, { useCallback, useState } from "react";
import Image from "next/image";
import {
  TiSocialTwitter,
  TiSocialYoutube,
  TiSocialInstagram,
} from "react-icons/ti";
import { FaTelegramPlane } from "react-icons/fa";
import { RiSendPlaneFill } from "react-icons/ri";
import style from "./Footer.module.css";
import img from "@/lib/img";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // Idle | loading | success | error
  const [message, setMessage] = useState("");

  // Subscribe
  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault(); // Prevent page navigation
      
      // Validation
      if (!email) {
        setStatus("error");
        setMessage("Please enter your email.");
        return;
      }
      // Status
      setStatus("loading");
      setMessage("");

      // Send email to api
      try {
        const res = await fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        // Safely attempt JSON (avoid the "<!DOCTYPE ..." parse error)
        let data = null;
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          data = await res.json();
        }
        if (!res.ok) {
          throw new Error(data?.error || "Failed to subscribe");
        }
        setStatus("success");
        setMessage("Subscribed!");
        setEmail("");
      } catch (err) {
        setStatus("error");
        setMessage(err?.message || "Something went wrong.");
      }
    },
    [email]
  );

  return (
    <footer className={style.footer} role="contentinfo">
      <div className={style.footer_box}>
        <div className={style.footer_box_social}>
          <Image
            src={img.logo}
            alt="Site logo"
            height={100}
            width={100}
            sizes="(max-width: 900px) 80px, 100px"
            priority
          />
          <p>
            Welcome to my NFT Marketplace! browse, create, Buy, sell, and trade
            NFTs with ease using our platform. This is a project for learning
            purpose
          </p>
          <div className={style.footer_social}>
            <a href="https:// Www.x.com">
              <TiSocialTwitter />
            </a>
            <a href="https:// Www.youtube.com">
              <TiSocialYoutube />
            </a>
            <a href="https:// Www.instagram.com">
              <TiSocialInstagram />
            </a>
            <a href="https:// Www.telegram.org">
              <FaTelegramPlane />
            </a>
          </div>
        </div>
        <div className={style.subscribe}>
          <h3>Subscribe</h3>
          <form className={style.subscribe_box} onSubmit={onSubmit}>
            <input
              type="email"
              placeholder="Enter your email *"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
            />
            <button
              type="submit"
              className={style.subscribe_box_button}
              disabled={status === "loading"}
              title="Subscribe">
              <RiSendPlaneFill />
            </button>
          </form>
          <div className={style.subscribe_box_info}>
            <p>Subscribe so you recieve the latest NFTs.</p>
            <p
              role="status"
              style={{ minHeight: 20, marginTop: 8 }}>
              {message}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

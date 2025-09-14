"use client";
import React, { useState, useEffect } from "react";
import style from "./Header.module.css";
import img from "@/lib/img";
import Discover from "./Discover/Discover";
import HelpCenter from "./HelpCenter/HelpCenter";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import HeaderType from "./HeaderType";

const Header = () => {
  const { address, isConnected } = useAccount(); //* connected account via wagmi

  //$ discover/help menu state - searchTerm
  const [discover, setDiscover] = useState(false);
  const [help, setHelp] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  //$ mobile stuff state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false);
  const [mobileHelpOpen, setMobileHelpOpen] = useState(false);

  const router = useRouter();

  //$ handle search
  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase(); //* remove whitespace and make lowercase
    setMobileOpen(false); //* close mobile view drawer
    if (term) {
      router.push(`/marketplace?search=${encodeURIComponent(term)}`);
    } else {
      router.push("/marketplace");
    }
  };

  //$ add or check for user in db when a user connects
  useEffect(() => {
    if (!isConnected || !address) return;
    fetch("/api/add-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: address }),
    }).catch(console.error);
  }, [isConnected, address]);

  //$ lock scroll when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  return (
    <HeaderType
      style={style}
      img={img}
      router={router}
      isConnected={isConnected}

      //$ search
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      handleSearch={handleSearch}

      //$ dropdowns
      Discover={Discover}
      HelpCenter={HelpCenter}

      //$ dropdowns desktop state
      discover={discover}
      setDiscover={setDiscover}
      help={help}
      setHelp={setHelp}

      //$ mobile drawer state
      mobileOpen={mobileOpen}
      setMobileOpen={setMobileOpen}
      mobileDiscoverOpen={mobileDiscoverOpen}
      setMobileDiscoverOpen={setMobileDiscoverOpen}
      mobileHelpOpen={mobileHelpOpen}
      setMobileHelpOpen={setMobileHelpOpen}

      // routing + wallet info

    />
  );
};

export default Header;

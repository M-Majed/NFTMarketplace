"use client";
import React, { useState, useEffect } from "react";
import style from "./Header.module.css";
import img from "@/lib/img";
import Discover from "./Discover/Discover";
import HelpCenter from "./HelpCenter/HelpCenter";
import { useRouter } from "next/navigation";
import HeaderType from "./HeaderType";
import { useAccount, useSignMessage, useChainId } from "wagmi";
import { useSession, signIn, signOut } from "next-auth/react";
import { SiweMessage } from "siwe";

const Header = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: session, status } = useSession(); // status can be 'authenticated', 'unauthenticated', 'loading'
  const { signMessageAsync } = useSignMessage();

  //$ discover/help menu state - searchTerm
  const [discover, setDiscover] = useState(false);
  const [help, setHelp] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  //$ mobile stuff state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileDiscoverOpen, setMobileDiscoverOpen] = useState(false);
  const [mobileHelpOpen, setMobileHelpOpen] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Fetch a unique nonce from our backend
      const res = await fetch("/api/auth/csrf");
      const { csrfToken } = await res.json();
      if (!csrfToken) throw new Error("Could not fetch nonce.");

      // Create the message to be signed
      const message = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Please sign in to the NFT Marketplace.",
        uri: window.location.origin,
        version: "1",
        chainId,
        nonce: csrfToken, // The unique nonce
      });

      // Prompt user to sign the message with their wallet
      const signature = await signMessageAsync({
        message: message.prepareMessage(),
      });

      // Send the signed message to our backend for verification
      const resSignin = await signIn("credentials", {
        message: JSON.stringify(message),
        redirect: false,
        signature,
      });
      if (resSignin?.error) throw new Error(resSignin.error);
    } catch (error) {
      console.error("Authentication failed", error);
    }
  };

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
   // If not connected, nothing to do
   if (!isConnected || status === "loading") return;

   // If authenticated with a *different* wallet, sign out first to drop the old session/cookies
   const sessionAddr = session?.user?.address?.toLowerCase?.();
   const walletAddr  = address?.toLowerCase?.();
   const mismatch = sessionAddr && walletAddr && sessionAddr !== walletAddr;

   (async () => {
     try {
       if (status === "authenticated" && mismatch) {
         await signOut({ redirect: false });
       }
       if (status !== "authenticated") {
         await handleLogin();
       }
     } catch (e) {
       console.error(e);
     }
   })();
 }, [isConnected, status, address, session?.user?.address]);

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

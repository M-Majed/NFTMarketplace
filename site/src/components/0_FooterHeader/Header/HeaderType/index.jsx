"use client";
import { useState, useEffect } from "react";
import HeaderDesktop from "./desktop/HeaderDesktop";
import HeaderMobile from "./mobile/HeaderMobile";

const useMedia = (query) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query); // Create matchMedia object - built-in browser API
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener("change", onChange); // Do onChange when change event happens
    return () => m.removeEventListener("change", onChange); // Cleanup
  }, [query]);
  return matches;
};

export default function HeaderType(props) {
  const isMobile = useMedia("(max-width: 1300px)");
  return isMobile ? <HeaderMobile {...props} /> : <HeaderDesktop {...props} />;
}

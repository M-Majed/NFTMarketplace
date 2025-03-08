import React from 'react'
import { HeroSection, Service, BigNFTSilder, Title, Category, Filter, NFTCard } from "../components/index";
//$ things in this page: show specific page

const Home = () => {
  return (
    <div>
      <HeroSection />
      <Service />
      <BigNFTSilder />
      <Filter />
      <NFTCard />
      <Category />
    </div>
  );
};

export default Home;
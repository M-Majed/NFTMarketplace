import React from 'react'
import { HeroSection, Service, BigNFTSilder, Title, Category, Filter } from "../components/index";
//$ things in this page: show specific page

const Home = () => {
  return (
    <div>
      <HeroSection />
      <Service />
      <BigNFTSilder />
      <Category/>
      <Filter/>
    </div>
  );
};

export default Home;
import React from "react";


import { NFTMarketplaceContext } from "../Context/NFTMarketplaceContext";
import { useContext, useState, useEffect } from "react";

const Home = () => {
  const {currentAccount } = useContext(NFTMarketplaceContext);
  return (
    <div>
      <h1>Welcome, {currentAccount}</h1>
      <a href="/uploadNFT">Create NFT</a>

    </div>
  );
};

export default Home;
import React from 'react'
import Introduction from '@/components/1_MainPage/Introduction/Introduction';
import Service from '@/components/1_MainPage/Service/Service';
import BigNFTSilder from '@/components/1_MainPage/BigNFTSlider/BigNFTSlider';
import Category from '@/components/1_MainPage/Category/Category';

const Home = () => {
  return (
    <div>
      <Introduction />
      <Service />
      <BigNFTSilder />
      <Category />
    </div>
  );
};

export default Home;
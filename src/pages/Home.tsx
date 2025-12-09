import React from 'react';
import Hero from '../components/Home/Hero';
import Career from '../components/Home/Career';
import Partners from '../components/Home/Partners';
import Footer from '../components/Home/Footer';

const Home = () => {
  return (
    <div className="space-y-16">
      <Hero />
      <Career />
      <Partners />
      <Footer />
    </div>
  );
};

export default Home;

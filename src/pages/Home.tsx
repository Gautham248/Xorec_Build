import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Portfolio from '../components/Portfolio';
import Clients from '../components/Clients';
import Process from '../components/Process';
import Testimonials from '../components/Testimonials';

const Home = () => {
  return (
    <>
      <Hero />
      <Services />
      <Portfolio />
      <Clients />
      <Process />
      <Testimonials />
    </>
  );
};

export default Home;
import React, { useRef } from 'react';
import Header from '../components/Header/Header'; 
import Hero from '../components/Hero/Hero'; 
import Features from '../components/Features/Features';
import Steps from '../components/Steps/Steps';

const Home = () => {
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="App">
      <Header />
      <main>
        <Hero onScrollToNext={scrollToFeatures} />
        
        <Features ref={featuresRef} />
        
        <Steps />
      </main>
    </div>
  );
};

export default Home;
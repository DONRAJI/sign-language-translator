import React, { useRef } from 'react';
import Header from '../components/Header/Header'; 
import Hero from '../components/Hero/Hero'; 
import Features from '../components/Features/Features';
import Steps from '../components/Steps/Steps';

const Home = () => {
  // Features 섹션을 참조할 ref 생성
  const featuresRef = useRef(null);

  // ref가 가리키는 곳으로 부드럽게 스크롤하는 함수
  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="App">
      <Header />
      <main>
        {/* Hero 컴포넌트에 스크롤 함수를 props로 전달 */}
        <Hero onScrollToNext={scrollToFeatures} />
        
        {/* Features 컴포넌트에 ref 연결 */}
        <Features ref={featuresRef} />
        
        <Steps />
      </main>
    </div>
  );
};

export default Home;
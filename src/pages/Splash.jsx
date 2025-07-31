import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Gugi&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

// 부드러운 사라짐 효과
const fadeOut = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`;

const SplashContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #fff;
  animation: ${props => props.disappear && fadeOut} 0.5s forwards;
`;

const LogoText = styled.h1`
  font-size: 10rem;
  font-weight: bold;
  font-family: 'Gugi', cursive;
  background: linear-gradient(135deg, #FFC0CB, #DDA0DD);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
`;

const Splash = () => {
  const navigate = useNavigate();
  const [disappear, setDisappear] = React.useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisappear(true);
      // 애니메이션 시간 후 페이지 이동
      setTimeout(() => navigate('/home'), 500);
    }, 2500); // 2.5초 후 사라지기 시작

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 제거
  }, [navigate]);

  return (
    <SplashContainer disappear={disappear}>
      <LogoText>손짓</LogoText>
    </SplashContainer>
  );
};

export default Splash;
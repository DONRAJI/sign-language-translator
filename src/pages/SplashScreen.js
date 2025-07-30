import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Gugi&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/main');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <h1
        className="gugi-regular"
        style={{
          margin: 0,
          fontWeight: 400,
          fontSize: '15vw',
          lineHeight: 1,
          background: 'linear-gradient(180deg, rgba(255, 185, 179, 0.95) 51.92%, rgba(220, 165, 215, 0.95) 75%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: 'transparent',
          textAlign: 'center',
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        손짓
      </h1>
      <style>
        {`
          .gugi-regular {
            font-family: "Gugi", sans-serif;
            font-weight: 400;
            font-style: normal;
          }
        `}
      </style>
    </div>
  );
};

export default SplashScreen;
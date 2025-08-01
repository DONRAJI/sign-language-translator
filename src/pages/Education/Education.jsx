import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import Header from '../../components/Header/Header';
import './Education.css';

// 학습할 단어 데이터
const challenges = [
  { word: '사과', videoSrc: '/videos/apple.mp4' },
  { word: '감사합니다', videoSrc: '/videos/thankyou.mp4' },
  { word: '안녕하세요', videoSrc: '/videos/hello.mp4' },
];

// ✅ 1. GameScreen 컴포넌트를 Education 컴포넌트의 바깥으로 분리합니다.
const GameScreen = () => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [feedback, setFeedback] = useState('버튼을 눌러 정답을 확인하세요!');
  const [accuracy, setAccuracy] = useState(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckSign = () => {
    setIsChecking(true);
    setFeedback('AI가 당신의 손짓을 분석 중입니다...');
    setAccuracy(null);
    setTimeout(() => {
      const isCorrect = Math.random() > 0.4;
      if (isCorrect) {
        setAccuracy(Math.floor(Math.random() * 10) + 90);
        setFeedback('정답입니다! 완벽해요!');
      } else {
        setAccuracy(Math.floor(Math.random() * 30) + 40);
        setFeedback('조금 더 연습해볼까요? 다시 시도해보세요!');
      }
      setIsChecking(false);
    }, 2500);
  };

  const handleNextChallenge = () => {
    setCurrentChallengeIndex((prevIndex) => (prevIndex + 1) % challenges.length);
    setFeedback('버튼을 눌러 정답을 확인하세요!');
    setAccuracy(null);
  };

  const currentChallenge = challenges[currentChallengeIndex];

  return (
    <div className="content-wrapper edu-wrapper">
      <h1 className="page-title">오늘의 단어</h1>
      <div className="challenge-grid">
        <div className="grid-item example-panel">
          <h2>제시 단어: "{currentChallenge.word}"</h2>
          <div className="video-container">
            <video key={currentChallenge.videoSrc} width="100%" autoPlay loop muted playsInline>
              <source src={currentChallenge.videoSrc} type="video/mp4" />
            </video>
          </div>
          <button onClick={handleNextChallenge} className="next-button">다음 문제</button>
        </div>
        <div className="grid-item user-panel">
          <h2>당신의 손짓</h2>
          <div className="user-webcam-container">
            <Webcam audio={false} mirrored={true} className="user-webcam" />
          </div>
          <div className="feedback-panel">
            {accuracy !== null && (
              <div className="accuracy-display" style={{ color: accuracy > 89 ? '#28a745' : '#dc3545' }}>
                정확도: {accuracy}%
              </div>
            )}
            <div className="feedback-text">{feedback}</div>
          </div>
          <button onClick={handleCheckSign} disabled={isChecking} className="check-button">
            {isChecking ? '분석 중...' : '정답 확인'}
          </button>
        </div>
      </div>
    </div>
  );
};


// ✅ 2. 메인 Education 컴포넌트는 상태 관리와 화면 전환만 담당합니다.
const Education = () => {
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    document.body.style.background = 'linear-gradient(180deg, #DDA9D9 0%, #BE93C5 100%)';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  const handleGameStart = () => {
    setGameStarted(true);
  };

  return (
    <div className="education-container">
      <Header />
      {gameStarted ? (
        <GameScreen />
      ) : (
        <div className="game-start-container">
          <button className="start-button" onClick={handleGameStart}>
            Game Start!
          </button>
        </div>
      )}
    </div>
  );
};

export default Education;
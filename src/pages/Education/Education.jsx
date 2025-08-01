import React, { useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import Header from '../../components/Header/Header';
// ✅ 아이콘 추가
import { IoEyeOutline, IoHappyOutline, IoEnterOutline, IoHelpCircleOutline, IoCheckmarkCircle } from "react-icons/io5";
import './Education.css';

// 학습할 단어 데이터
const challenges = [
  { word: '사랑', videoSrc: '/videos/love.mp4' },
  { word: '사과', videoSrc: '/videos/apple.mp4' },
  { word: '감사합니다', videoSrc: '/videos/thankyou.mp4' },
];

const IntroScreen = ({ onGameStart }) => (
  <div className="intro-container">
    <div className="intro-card">
      <h1>따라해요 손짓</h1>
      <p className="intro-paragraph">
        따라해요 손짓에 오신 것을 환영합니다!<br />
        수어 학습이 이렇게 재미있을 수 있을까요?<br />
        여러분의 수어 친구가 함께 할 '따라해요 손짓'에 오신 것을 환영해요!
      </p>
      
      <div className="intro-steps">
        {/* ✅ 아이콘을 위로, 번호와 텍스트를 아래로 구조 변경 */}
        <div className="intro-step-item">
          <IoEyeOutline className="step-icon" />
          <div className="step-description">
            <div className="step-number">1</div>
            <span>동작을 눈으로 익히고</span>
          </div>
        </div>
        <div className="intro-step-item">
          <IoHappyOutline className="step-icon" />
          <div className="step-description">
            <div className="step-number">2</div>
            <span>카메라를 보며 따라해주세요</span>
          </div>
        </div>
        <div className="intro-step-item">
          <IoEnterOutline className="step-icon" />
          <div className="step-description">
            <div className="step-number">3</div>
            <span>정답을 맞혔다면, 다음 단계로!</span>
          </div>
        </div>
      </div>

      <p className="intro-challenge-text">지금 바로 첫 번째 손짓에 도전해 볼까요?</p>
    </div>
    <button className="game-start-button" onClick={onGameStart}>
      <div className="character-avatar"></div>
      <span>Game Start!</span>
    </button>
  </div>
);

// 2. 게임 진행 화면 컴포넌트
const GameScreen = ({ onCorrectAnswer }) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);

  const handleCheckAnswer = () => {
    // AI 모델 분석 로직 시뮬레이션
    setTimeout(() => {
      onCorrectAnswer(challenges[currentChallengeIndex].word);
    }, 1500); // 1.5초 후 정답 처리
  };
  
  const currentChallenge = challenges[currentChallengeIndex];

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="character-avatar"></div>
        <p>자, 게임 시작! 화면에 나타나는 캐릭터의 손짓을 잘 보고 그대로 따라 해보세요.</p>
      </div>
      <div className="game-grid">
        <div className="video-panel">
          <video key={currentChallenge.videoSrc} width="100%" autoPlay loop muted playsInline>
            <source src={currentChallenge.videoSrc} type="video/mp4" />
          </video>
        </div>
        <div className="webcam-panel">
          <div className="webcam-header">
            <span>카메라</span>
            <input type="checkbox" defaultChecked readOnly />
          </div>
          <div className="webcam-view">
            <Webcam audio={false} mirrored={true} />
          </div>
        </div>
      </div>
      {/* 정답 확인 버튼을 임시로 추가하여 흐름을 테스트합니다. */}
      <button onClick={handleCheckAnswer} className="temp-check-button">임시 정답 확인</button>
    </div>
  );
};

// 3. 정답 화면 컴포넌트
const CorrectScreen = ({ word, onNextChallenge }) => (
  <div className="game-container">
    <div className="game-header">
      <img src="/character.png" alt="캐릭터" />
      <p>정확히 따라했어요!</p>
    </div>
    <div className="game-grid correct-grid">
        <div className="video-panel">
            <img src="/correct_example.png" alt="정답 예시" />
        </div>
        <div className="webcam-panel">
            <div className="webcam-header">
                <span>카메라</span>
                <input type="checkbox" defaultChecked readOnly />
            </div>
            <div className="webcam-view">
              <Webcam audio={false} mirrored={true} />
            </div>
        </div>
    </div>
    <div className="correct-feedback">
      <div className="answer-box">
        <IoCheckmarkCircle /> 사랑!
      </div>
      <button className="next-challenge-button" onClick={onNextChallenge}>
        다음
      </button>
    </div>
  </div>
);

// 메인 Education 컴포넌트
const Education = () => {
  const [gameState, setGameState] = useState('intro'); // 'intro', 'playing', 'correct'
  const [correctWord, setCorrectWord] = useState('');

  useEffect(() => {
    document.body.style.background = 'linear-gradient(180deg, #FFBCB7 0%, #DDA9D9 100%)';
    return () => { document.body.style.background = ''; };
  }, []);

  const handleGameStart = () => setGameState('playing');
  const handleCorrectAnswer = (word) => {
    setCorrectWord(word);
    setGameState('correct');
  };
  const handleNextChallenge = () => setGameState('playing');

  return (
    <div className="education-container">
      <Header />
      <div className="help-tooltip-wrapper">
        <IoHelpCircleOutline className="help-icon" />
        <div className="tooltip-box">
          <ul>
            <li>카메라와 1-2미터 거리를 유지해주세요.</li>
            <li>충분한 조명이 있는 곳에서 사용해주세요.</li>
            <li>손과 팔이 화면에 잘 보이도록 해주세요.</li>
            <li>천천히 수어해주세요.</li>
          </ul>
        </div>
      </div>
      
      {gameState === 'intro' && <IntroScreen onGameStart={handleGameStart} />}
      {gameState === 'playing' && <GameScreen onCorrectAnswer={handleCorrectAnswer} />}
      {gameState === 'correct' && <CorrectScreen word={correctWord} onNextChallenge={handleNextChallenge} />}
    </div>
  );
};

export default Education;
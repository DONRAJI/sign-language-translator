import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Hands } from '@mediapipe/hands';
import Header from '../../components/Header/Header';
// ✅ 스피커 아이콘과 닫기 아이콘을 import
import { IoClose, IoVolumeMediumOutline } from 'react-icons/io5';
import './Translator.css';

const Translator = () => {
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [loggedWords, setLoggedWords] = useState([]);
  
  const webcamRef = useRef(null);
  const handsRef = useRef(null);
  
  useEffect(() => {
    document.body.style.background = 'linear-gradient(180deg, #FFBCB7 0%, #DDA9D9 100%)';
    return () => { document.body.style.background = ''; };
  }, []);

  // ✅ 1. TTS 버튼 클릭 시 단어를 읽어주는 함수
  const handleSpeak = (textToSpeak) => {
    // 진행 중인 다른 음성이 있다면 중단
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ko-KR';
    window.speechSynthesis.speak(utterance);
  };
  


  // MediaPipe 초기화 (이하 모든 AI 관련 로직은 이전과 동일)
  const initializeMediaPipe = useCallback(() => {
    const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});
    hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
    hands.onResults(onResults);
    handsRef.current = hands;
  }, []); // onResults를 의존성 배열에서 제거하여 무한 루프 방지

  const predictSign = (landmarks) => {
    const mockWords = ['안녕하세요', '저는', '감사합니다', '손짓', '입니다'];
    return mockWords[Math.floor(Math.random() * mockWords.length)];
  };

  const onResults = useCallback((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const predictedWord = predictSign(landmarks);
      
      // 예측된 단어가 이전 로그의 가장 최신 단어와 다를 때만 로그에 추가
      if (predictedWord && (!loggedWords.length || predictedWord !== loggedWords[0].text)) {
        setCurrentWord(predictedWord);
        const newWordLog = { id: Date.now(), text: predictedWord };
        setLoggedWords(prev => [newWordLog, ...prev.slice(0, 19)]);
      }
    }
  }, [loggedWords]); // currentWord 대신 loggedWords를 의존성으로 사용

  useEffect(() => {
    if(!handsRef.current) {
        initializeMediaPipe();
    }
  }, [initializeMediaPipe]);
  
  useEffect(() => {
    const loadCustomModel = async () => { /* ... */ };
    if (isWebcamOn) loadCustomModel();
  }, [isWebcamOn]);

  useEffect(() => {
    let frameId;
    let lastProcessedTime = 0;
    const processInterval = 4000;
    const processVideo = async (currentTime) => {
      if (isWebcamOn && webcamRef.current?.video && !isModelLoading && handsRef.current) {
        if (currentTime - lastProcessedTime > processInterval) {
          lastProcessedTime = currentTime;
          await handsRef.current.send({ image: webcamRef.current.video });
        }
      }
      frameId = requestAnimationFrame(processVideo);
    };
    frameId = requestAnimationFrame(processVideo);
    return () => cancelAnimationFrame(frameId);
  }, [isWebcamOn, isModelLoading]);

  return (
    <div className="translator-container">
      <Header />
      <div className="content-wrapper">
        <h1 className="page-title">실시간 수어 통역</h1>
        <div className="grid-container">
          
          {/* ✅ 누락된 코드 복구 */}
          <div className="grid-item webcam-card">
            <div className="card-header">
              <h3>웹캠 화면</h3>
              <div className="camera-toggle">
                <span>카메라</span>
                <input type="checkbox" checked={isWebcamOn} readOnly onClick={() => setIsWebcamOn(!isWebcamOn)} />
              </div>
            </div>
            <div className="webcam-body">
              <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="webcam-video" hidden={!isWebcamOn} />
              {isModelLoading && <div className="loading-overlay">AI 모델을 불러오는 중...</div>}
              {!isWebcamOn && (
                <div className="webcam-placeholder" onClick={() => setIsWebcamOn(true)}>
                  카메라 버튼을 눌러주세요
                </div>
              )}
            </div>
          </div>
          
          <div className="grid-item log-card">
            <h3>번역된 단어</h3>
            <div className="log-list">
              {loggedWords.map(word => (
                <div key={word.id} className="log-item">
                  <p>{word.text}</p>
                  {/* ✅ TTS 버튼 추가 */}
                  <div className="log-item-buttons">
                    <button className="speak-btn" onClick={() => handleSpeak(word.text)}>
                      <IoVolumeMediumOutline />
                    </button>
                    <button className="close-btn"><IoClose /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid-item recognized-card">
            <h3>현재 인식된 단어</h3>
            <div className="recognized-content">
              <span className="current-word-display">{isWebcamOn ? (currentWord || '...') : ''}</span>
              <p>{isWebcamOn ? (currentWord ? '단어가 인식되었습니다' : '인식 대기 중...') : ''}</p>
            </div>
          </div>
          
          {/* ✅ 누락된 코드 복구 */}
          <div className="grid-item tips-card">
            <h3>사용 팁</h3>
            <ul>
              <li>카메라와 1-2미터 거리를 유지해주세요.</li>
              <li>충분한 조명이 있는 곳에서 사용해주세요.</li>
              <li>손과 팔이 화면에 잘 보이도록 찍주세요.</li>
              <li>천천히 수어해주세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Translator;
import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import Header from '../../components/Header/Header';
import { IoClose } from 'react-icons/io5';
import './Translator.css';
import io from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000';

const Translator = () => {
  const [isWebcamOn, setIsWebcamOn] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [translatedSentences, setTranslatedSentences] = useState([]);
  
  const webcamRef = useRef(null);
  const sentenceBuffer = useRef([]);
  const socketRef = useRef(null);
  const lastPredictedWord = useRef(null);

  useEffect(() => {
    document.body.style.background = 'linear-gradient(180deg, #FFBCB7 0%, #DDA9D9 100%)';
    return () => {
      document.body.style.background = ''; 
    };
  }, []);

  // [핵심 해결책] 웹캠 제어 및 웹소켓 연결/해제 로직
  useEffect(() => {
    // isWebcamOn이 true일 때만 소켓 로직 실행
    if (isWebcamOn) {
      console.log('웹캠 켜짐 - 웹소켓 서버 연결 시작');
      setIsModelLoading(true);

      const socket = io(SOCKET_SERVER_URL, {
        reconnection: true,
        transports: ['websocket'], // polling은 제외하는 것이 성능에 더 나을 수 있음
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('웹소켓 서버에 성공적으로 연결되었습니다. (ID:', socket.id, ')');
        setIsModelLoading(false);
        // 이제 'start_detection'은 큰 의미가 없지만, 서버 로그를 위해 유지
        socket.emit('start_detection');
      });

      socket.on('status', (data) => {
        console.log('서버 상태 메시지:', data.message);
      });
      
      const frameSender = setInterval(() => {
        if (webcamRef.current && socket.connected) {
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            socket.emit('process_frame', { image: imageSrc });
          }
        }
      }, 200);

      socket.on('prediction_result', (data) => {
        if (data && data.confidence > 0.7) {
          const predictedWord = data.predicted_action;

          if (predictedWord && predictedWord !== lastPredictedWord.current) {
            setCurrentWord(predictedWord);
            lastPredictedWord.current = predictedWord;
            
            if (sentenceBuffer.current[sentenceBuffer.current.length - 1] !== predictedWord) {
                sentenceBuffer.current.push(predictedWord);
            }

            if (sentenceBuffer.current.length >= 3) {
              const newSentence = {
                id: Date.now(),
                title: `문장 ${translatedSentences.length + 1}`,
                text: sentenceBuffer.current.join(' '),
              };
              setTranslatedSentences(prev => [newSentence, ...prev.slice(0, 9)]);
              sentenceBuffer.current = [];
            }
          }
        }
      });

      socket.on('disconnect', (reason) => {
        console.log('웹소켓 서버 연결이 끊어졌습니다. 이유:', reason);
        setCurrentWord('서버 연결 끊김');
      });

      socket.on('connect_error', (error) => {
        console.error('웹소켓 연결 오류:', error);
        setIsModelLoading(false);
        setCurrentWord('서버 연결 실패');
      });

      // 클린업 함수: 웹캠이 꺼지거나 컴포넌트가 사라질 때만 실행됨
      return () => {
        console.log('웹캠 꺼짐 또는 언마운트 - 인터벌 및 소켓 연결 해제');
        clearInterval(frameSender);
        if (socket) {
          socket.emit('stop_detection');
          socket.disconnect();
        }
      };
    } else {
      // isWebcamOn이 false일 때의 처리
      setIsModelLoading(false);
      setCurrentWord('');
      sentenceBuffer.current = [];
      lastPredictedWord.current = null;
    }
  // [핵심] 의존성 배열에서 translatedSentences.length를 반드시 제거해야 합니다.
  }, [isWebcamOn]);

  return (
    <div className="translator-container">
      {/* ... 이하 JSX 구조는 변경 없음 ... */}
      <Header />
      <div className="content-wrapper">
        <h1 className="page-title">실시간 수어 통역</h1>
        <div className="grid-container">
          <div className="grid-item webcam-card">
            <div className="card-header">
              <h3>웹캠 화면</h3>
              <div className="camera-toggle">
                <span>카메라</span>
                <input type="checkbox" checked={isWebcamOn} readOnly onClick={() => setIsWebcamOn(!isWebcamOn)} />
              </div>
            </div>
            <div className="webcam-body">
              {isWebcamOn ? (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="webcam-video"
                  mirrored={true}
                />
              ) : (
                <div className="webcam-placeholder" onClick={() => setIsWebcamOn(true)}>
                  카메라 버튼을 눌러주세요
                </div>
              )}
              {isWebcamOn && isModelLoading && <div className="loading-overlay">AI 서버에 연결 중...</div>}
            </div>
          </div>
          
          <div className="grid-item translated-card">
            <h3>번역된 자모음</h3>
            <div className="translated-list">
              {translatedSentences.map(sentence => (
                <div key={sentence.id} className="translated-item">
                  <div className="item-header">
                    <span>{sentence.title}</span>
                    <button className="close-btn" onClick={() => setTranslatedSentences(prev => prev.filter(s => s.id !== sentence.id))}>
                      <IoClose />
                    </button>
                  </div>
                  <p>{sentence.text}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid-item recognized-card">
            <h3>현재 인식된 자모음</h3>
            <div className="recognized-content">
              <span className={currentWord && !currentWord.includes('서버') ? 'success-word' : ''}>
                {isWebcamOn ? (currentWord || '...') : '인식 대기 중'}
              </span>
              <p>
                {isWebcamOn ? (currentWord ? '단어가 인식되었습니다' : '손 모양을 보여주세요...') : ''}
              </p>
            </div>
          </div>
          
          <div className="grid-item tips-card">
            <h3>사용 팁</h3>
            <ul>
              <li>카메라와 1-2미터 거리를 유지해주세요.</li>
              <li>충분한 조명이 있는 곳에서 사용해주세요.</li>
              <li>손과 팔이 화면에 잘 보이도록 찍어주세요.</li>
              <li>천천히 수어해주세요.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Translator;
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Holistic, POSE_CONNECTIONS, FACEMESH_TESSELATION, HAND_CONNECTIONS } from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { InferenceSession, Tensor } from 'onnxruntime-web';
import Header from '../../components/Header/Header';
import { IoClose } from 'react-icons/io5';
import './Translator.css';

// 클래스 레이블 (ONNX 모델과 순서가 일치해야 함)
const CLASS_LABELS = ['감기', '고민', '라면', '수어', '슬프다']; 
const SEQUENCE_LENGTH = 150; // 모델이 학습된 시퀀스 길이 (예: 30 프레임)

const Translator = () => {
    const [isWebcamOn, setIsWebcamOn] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [currentWord, setCurrentWord] = useState('');
    const [lowConfidencePrediction, setLowConfidencePrediction] = useState(null);
    const [translatedSentences, setTranslatedSentences] = useState([]);
    
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const holisticRef = useRef(null);
    const sessionRef = useRef(null);
    const sentenceBuffer = useRef([]);
    const sequenceBuffer = useRef([]);
    const lastSuccessfulWord = useRef(null);
    const animationFrameId = useRef(null);
    const lastPredictionTime = useRef(0); // 추론 간격 조절용

    // 랜드마크 데이터를 1차원 배열로 변환하는 함수
    const extractKeypoints = (results) => {
        const pose = results.poseLandmarks ? results.poseLandmarks.map(lm => [lm.x, lm.y, lm.z, lm.visibility]).flat() : new Array(33 * 4).fill(0);
        const face = results.faceLandmarks ? results.faceLandmarks.map(lm => [lm.x, lm.y, lm.z]).flat() : new Array(468 * 3).fill(0);
        const lh = results.leftHandLandmarks ? results.leftHandLandmarks.map(lm => [lm.x, lm.y, lm.z]).flat() : new Array(21 * 3).fill(0);
        const rh = results.rightHandLandmarks ? results.rightHandLandmarks.map(lm => [lm.x, lm.y, lm.z]).flat() : new Array(21 * 3).fill(0);
        return [...pose, ...face, ...lh, ...rh];
    };

    // MediaPipe Holistic 결과 콜백 함수
    const onResults = useCallback(async (results) => {
        const canvasElement = canvasRef.current;
        if (!canvasElement) return;

        const canvasCtx = canvasElement.getContext('2d');
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // --- 화면 좌우 반전 로직 ---
        canvasCtx.scale(-1, 1);
        canvasCtx.translate(-canvasElement.width, 0);

        // 비디오 프레임을 캔버스에 그림 (미러링된 효과)
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        
        // 랜드마크 그리기
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
        drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
        drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
        drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 5 });
        drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 5 });

        canvasCtx.restore();

        // --- ONNX 추론 로직 ---
        const keypoints = extractKeypoints(results);
        sequenceBuffer.current.push(keypoints);
        if (sequenceBuffer.current.length > SEQUENCE_LENGTH) {
            sequenceBuffer.current.shift();
        }

        const now = performance.now();
        if (sequenceBuffer.current.length === SEQUENCE_LENGTH && now - lastPredictionTime.current > 500) { // 0.5초마다 추론
            lastPredictionTime.current = now;
            
            const flatData = sequenceBuffer.current.flat();
            const inputTensor = new Tensor('float32', Float32Array.from(flatData), [1, SEQUENCE_LENGTH, 1662]);
            
            try {
                const feeds = { 'input': inputTensor }; // ONNX 모델의 입력 이름
                const outputMap = await sessionRef.current.run(feeds);
                const outputTensor = outputMap.output; // ONNX 모델의 출력 이름
                const prediction = Array.from(outputTensor.data);

                const maxProb = Math.max(...prediction);
                const maxIndex = prediction.indexOf(maxProb);
                const predictedWord = CLASS_LABELS[maxIndex];

                if (maxProb >= 0.8) { // 신뢰도 임계값 조정
                    setLowConfidencePrediction(null);
                    if (predictedWord && predictedWord !== lastSuccessfulWord.current) {
                        lastSuccessfulWord.current = predictedWord;
                        setCurrentWord(predictedWord);
                        
                        // 문장 버퍼에 추가 (중복 방지)
                        if (sentenceBuffer.current[sentenceBuffer.current.length - 1] !== predictedWord) {
                            sentenceBuffer.current.push(predictedWord);
                        }

                        if (sentenceBuffer.current.length >= 3) {
                            const newSentence = { id: Date.now(), text: sentenceBuffer.current.join(' ') };
                            setTranslatedSentences(prev => [newSentence, ...prev.slice(0, 9)]);
                            sentenceBuffer.current = [];
                        }
                    }
                } else {
                    setCurrentWord('');
                    setLowConfidencePrediction({ word: predictedWord, confidence: maxProb });
                }
            } catch (e) {
                console.error("ONNX 추론 에러:", e);
            }
        }
    }, []);

    // Holistic & ONNX 모델 초기화
    useEffect(() => {
        const initialize = async () => {
            setIsModelLoading(true);
            try {
                // Holistic 초기화
                const holistic = new Holistic({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}` });
                holistic.setOptions({
                    modelComplexity: 1,
                    smoothLandmarks: true,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });
                holistic.onResults(onResults);
                holisticRef.current = holistic;

                // ONNX 런타임 및 모델 로드
                const session = await InferenceSession.create('/sign_language_model_5_words.onnx');
                sessionRef.current = session;
                console.log("ONNX 모델 로딩 성공.");

            } catch (error) {
                console.error("초기화 실패:", error);
            }
            setIsModelLoading(false);
        };
        initialize();
    }, [onResults]);

    // 웹캠 프레임 처리 루프
    useEffect(() => {
        const processWebcam = async () => {
            if (isWebcamOn && !isModelLoading && webcamRef.current?.video && holisticRef.current) {
                const video = webcamRef.current.video;
                
                // 캔버스 크기를 비디오 크기에 맞춤
                if (canvasRef.current && (canvasRef.current.width !== video.videoWidth || canvasRef.current.height !== video.videoHeight)) {
                    canvasRef.current.width = video.videoWidth;
                    canvasRef.current.height = video.videoHeight;
                }

                await holisticRef.current.send({ image: video });
            }
            animationFrameId.current = requestAnimationFrame(processWebcam);
        };

        processWebcam();

        return () => {
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [isWebcamOn, isModelLoading]);
    
    // 배경색 설정
    useEffect(() => {
        document.body.style.background = 'linear-gradient(180deg, #FFBCB7 0%, #DDA9D9 100%)';
        return () => { document.body.style.background = ''; };
    }, []);

    return (
        <div className="translator-container">
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
                            {/* 웹캠은 보이지 않게 처리하고 스트림 소스로만 사용 */}
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                style={{ display: 'none' }} 
                                mirrored={true}
                                hidden={!isWebcamOn}
                                
                            />
                            {/* 모든 시각적 결과는 캔버스에 렌더링 */}
                            <canvas ref={canvasRef} className="webcam-canvas"></canvas>
                            {isModelLoading && <div className="loading-overlay">AI 모델을 불러오는 중...</div>}
                            {!isWebcamOn && !isModelLoading && (<div className="webcam-placeholder" onClick={() => setIsWebcamOn(true)}>카메라 버튼을 눌러주세요</div>)}
                        </div>
                    </div>

                    {/* 나머지 JSX 코드는 동일 */}
                    <div className="grid-item translated-card">
                        <h3>번역된 문단</h3>
                        <div className="translated-list">
                            {translatedSentences.map((sentence, index) => (
                                <div key={sentence.id} className="translated-item">
                                    <div className="item-header"><span>{`문단 ${translatedSentences.length - index}`}</span><button className="close-btn" onClick={() => setTranslatedSentences(prev => prev.filter(s => s.id !== sentence.id))}><IoClose /></button></div>
                                    <p>{sentence.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid-item recognized-card">
                        <h3>현재 인식된 단어</h3>
                        <div className="recognized-content">
                            {currentWord ? (
                                <>
                                    <h2 className="success-word">{currentWord}</h2>
                                    <p>단어가 인식되었습니다</p>
                                </>
                            ) : lowConfidencePrediction ? (
                                <>
                                    <h2 className="guess-word">{`"${lowConfidencePrediction.word}"`}</h2>
                                    <p>{`혹시 이 단어인가요? (정확도: ${Math.round(lowConfidencePrediction.confidence * 100)}%)`}</p>
                                </>
                            ) : (
                                <h2>{isWebcamOn ? '...' : '인식 대기 중'}</h2>
                            )}
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
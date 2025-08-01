import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Holistic } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { InferenceSession, Tensor } from 'onnxruntime-web';
import Header from '../../components/Header/Header';
import { IoClose } from 'react-icons/io5';
import './Translator.css';

// 클래스 레이블 (생략 없음)
const CLASS_LABELS = [
    '가래떡', '감기', '검사', '결승전', '고깃국', '고민', '고추', '고추가루', '급하다', '꽈배기',
    '꽈베기', '꿀물', '나사렛대학교', '낚시대', '낚시터', '남아', '냄비', '눈', '뉴질랜드', '다과',
    '당뇨병', '독서', '독신', '돼지고기', '된장찌개', '된장찌게', '두부', '딸기', '떡국', '라면',
    '막걸리', '매표소', '면역', '무', '발가락', '밥그릇', '밥솥', '방충', '배드민턴', '배추국',
    '배춧국', '벌꿀', '변비', '병명', '병문안', '보건소', '보신탕', '부엌', '불면증', '불행',
    '붕대', '비빔밥', '빈혈', '뻔뻔', '사골', '사과', '사위', '사이다', '설사', '성병',
    '성실', '소불고기', '소화제', '손녀', '손자', '수면제', '수어', '수집가', '슬프다', '신사',
    '싫어하다', '안타깝다', '알아서', '어색하다', '여아', '여행지', '열아홉번째', '영아', '예식장', '올림픽경기',
    '외국인', '운동경기', '음료수', '입원', '자극', '장애인', '재혼', '지방경찰청장', '진단서', '찬물',
    '첫번째', '축구장', '치료', '치료법', '친아들', '침착', '퇴원', '필기시험', '학교연혁', '한약',
    '한약방', '화상', '회복'
];
const POSE_INDICES = Array.from(Array(25).keys());
const FACE_INDICES = Array.from(Array(70).keys());
const HAND_INDICES = Array.from(Array(21).keys());

const Translator = () => {
    const [isWebcamOn, setIsWebcamOn] = useState(false);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [currentWord, setCurrentWord] = useState('');
    const [translatedSentences, setTranslatedSentences] = useState([]);
    
    // ✅ session을 state가 아닌 ref로 관리합니다.
    const sessionRef = useRef(null);
    const webcamRef = useRef(null);
    const holisticRef = useRef(null);
    const cameraRef = useRef(null);
    const sentenceBuffer = useRef([]);
    const sequenceBuffer = useRef([]);
    const lastPredictedWord = useRef(null);

    const onResults = useCallback(async (results) => {
        let combinedLandmarks = [];
        const pose = results.poseLandmarks || []; POSE_INDICES.forEach(i => { const lm = pose[i]; combinedLandmarks.push(lm ? lm.x : 0, lm ? lm.y : 0, lm ? lm.z : 0); });
        const face = results.faceLandmarks || []; FACE_INDICES.forEach(i => { const lm = face[i]; combinedLandmarks.push(lm ? lm.x : 0, lm ? lm.y : 0, lm ? lm.z : 0); });
        const leftHand = results.leftHandLandmarks || []; HAND_INDICES.forEach(i => { const lm = leftHand[i]; combinedLandmarks.push(lm ? lm.x : 0, lm ? lm.y : 0, lm ? lm.z : 0); });
        const rightHand = results.rightHandLandmarks || []; HAND_INDICES.forEach(i => { const lm = rightHand[i]; combinedLandmarks.push(lm ? lm.x : 0, lm ? lm.y : 0, lm ? lm.z : 0); });

        // 입력 데이터 준비 로직 (이 부분은 모델에 맞게 수정될 수 있습니다.)
        sequenceBuffer.current.push(combinedLandmarks);
        if (sequenceBuffer.current.length > 150) sequenceBuffer.current.shift();
        if (sequenceBuffer.current.length < 150) return;

        try {
            // ✅ ref로 session에 접근
            if (sessionRef.current) {
                const flatSequence = sequenceBuffer.current.flat();
                // 텐서 shape를 AI 모델의 입력 shape와 반드시 일치시켜야 합니다.
                // 150 * 1233 (411*3)
                const inputTensor = new Tensor('float32', Float32Array.from(flatSequence), [1, 150, 1233]);
                const feeds = { 'input': inputTensor };
                const results = await sessionRef.current.run(feeds);
                const outputTensor = results.output;
                const prediction = Array.from(outputTensor.data);
                const maxIndex = prediction.indexOf(Math.max(...prediction));
                const predictedWord = CLASS_LABELS[maxIndex];

                if (predictedWord && predictedWord !== lastPredictedWord.current) {
                    lastPredictedWord.current = predictedWord;
                    setCurrentWord(predictedWord);
                    if (!sentenceBuffer.current.includes(predictedWord)) {
                        sentenceBuffer.current.push(predictedWord);
                    }
                    if (sentenceBuffer.current.length >= 3) {
                        const newSentence = { id: Date.now(), text: sentenceBuffer.current.join(' ') };
                        setTranslatedSentences(prev => [{...newSentence, title: `문단 ${prev.length + 1}`}, ...prev.slice(0, 9)]);
                        sentenceBuffer.current = [];
                    }
                }
            }
        } catch(e) { console.error("Prediction Error: ", e); }
    }, []); // ✅ 의존성 배열을 비워 이 함수가 절대 재생성되지 않도록 합니다.

    // ✅ 1. 모든 초기화 로직은 이 useEffect에서 최초 1회만 실행됩니다.
    useEffect(() => {
        const initialize = async () => {
            console.log("Initializing models...");
            const holistic = new Holistic({
                locateFile: (file) => `/mediapipe/${file}`,
            });
            holistic.setOptions({
                modelComplexity: 1, smoothLandmarks: true,
                minDetectionConfidence: 0.5, minTrackingConfidence: 0.5,
            });
            holistic.onResults(onResults);
            holisticRef.current = holistic;
            try {
                const modelPath = '/sign_language_model.onnx';
                const newSession = await InferenceSession.create(modelPath);
                sessionRef.current = newSession; // ✅ 로드된 세션을 ref에 저장
                console.log("ONNX model loaded successfully.");
            } catch (error) {
                console.error("Failed to load the ONNX model:", error);
            }
            setIsModelLoading(false);
        };
        initialize();
    }, [onResults]);

    // ✅ 2. 카메라 켜고 끄는 로직은 별도의 useEffect에서 관리합니다.
    useEffect(() => {
        if (isWebcamOn && !isModelLoading && webcamRef.current?.video) {
            const videoElement = webcamRef.current.video;
            cameraRef.current = new Camera(videoElement, {
                onFrame: async () => {
                    if (videoElement && holisticRef.current) {
                        await holisticRef.current.send({ image: videoElement });
                    }
                },
                width: 640,
                height: 480,
            });
            cameraRef.current.start();
        }
        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop();
                cameraRef.current = null;
            }
        };
    }, [isWebcamOn, isModelLoading]);

    // 배경색 관리
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
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                className="webcam-video"
                                mirrored={true}
                                hidden={!isWebcamOn}
                            />
                            {isModelLoading && <div className="loading-overlay">AI 모델을 불러오는 중...</div>}
                            {!isWebcamOn && (
                                <div className="webcam-placeholder" onClick={() => setIsWebcamOn(true)}>
                                    카메라 버튼을 눌러주세요
                                </div>
                            )}
                        </div>
                    </div>
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
                            <h2>{isWebcamOn ? (currentWord || '...') : ''}</h2>
                            <p>{isWebcamOn ? (currentWord ? '단어가 인식되었습니다' : '인식 대기 중...') : ''}</p>
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
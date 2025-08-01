# ====================================================================
# web_app.py (최종 완성 - Blocking 문제 해결 버전)
# ====================================================================

# 1. Eventlet 몽키 패치를 가장 먼저 실행
import eventlet
eventlet.monkey_patch()

# 2. 필요한 라이브러리 임포트
from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import cv2
import mediapipe as mp
import numpy as np
import tensorflow as tf
import modules.holistic_module as hm
from modules.utils import Vector_Normalization
import time
import json
import traceback
import base64
from collections import deque

# Flask 앱과 SocketIO 객체 생성
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# --- 전역 변수 및 설정 ---
actions = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
           'ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ',
           'ㅐ', 'ㅒ', 'ㅔ', 'ㅖ', 'ㅢ', 'ㅚ', 'ㅟ']
seq_length = 10
detector = None
interpreter = None
user_sequences = {} # 사용자별 시퀀스 데이터를 저장할 딕셔너리
# --- 끝: 전역 변수 및 설정 ---

def initialize_detector_and_model():
    """MediaPipe 홀리스틱 모델과 TFLite 모델 초기화"""
    global detector, interpreter
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "..", "models", "multi_hand_gesture_classifier.tflite")
    
    if not os.path.exists(model_path):
        print(f"모델 파일을 찾을 수 없습니다: {model_path}")
        return False
    
    try:
        detector = hm.HolisticDetector(min_detection_confidence=0.3)
        interpreter = tf.lite.Interpreter(model_path=model_path)
        interpreter.allocate_tensors()
        print("모델 초기화 완료!")
        return True
    except Exception as e:
        print(f"모델 초기화 중 오류 발생: {e}")
        return False

def data_uri_to_cv2_img(uri):
    """Base64 인코딩된 이미지 문자열을 OpenCV 이미지로 변환"""
    try:
        encoded_data = uri.split(',')[1]
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return img
    except Exception:
        return None

# --- [핵심 해결책 1] 무거운 작업을 처리할 별도의 함수 생성 ---
def process_image_and_predict(sid, img):
    """
    이미지 처리 및 AI 예측의 모든 무거운 작업을 수행합니다.
    이 함수는 백그라운드 스레드에서 실행됩니다.
    """
    global user_sequences, detector, interpreter
    
    # 사용자별 시퀀스 데이터가 없으면 새로 생성
    if sid not in user_sequences:
        user_sequences[sid] = deque(maxlen=seq_length)
    
    seq = user_sequences[sid]
    
    # 이미지 처리 및 예측 로직
    img_processed = detector.findHolistic(img, draw=False)
    _, right_hand_lmList = detector.findRighthandLandmark(img_processed)
    
    if right_hand_lmList is not None:
        joint = np.zeros((42, 2))
        if right_hand_lmList.landmark:
            for j, lm in enumerate(right_hand_lmList.landmark):
                if j < 42:
                    joint[j] = [lm.x, lm.y]
        
        vector, angle_label = Vector_Normalization(joint)
        d = np.concatenate([vector.flatten(), angle_label.flatten()])
        seq.append(d)
        
        if len(seq) >= seq_length:
            input_data = np.expand_dims(np.array(seq, dtype=np.float32), axis=0)
            
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            interpreter.set_tensor(input_details[0]['index'], input_data)
            interpreter.invoke()
            y_pred = interpreter.get_tensor(output_details[0]['index'])[0]
            
            i_pred = int(np.argmax(y_pred))
            conf = y_pred[i_pred]
            
            if conf > 0.95:
                predicted_action = actions[i_pred]
                
                # 예측 결과를 해당 클라이언트에게만 전송
                socketio.emit('prediction_result', {
                    'predicted_action': predicted_action,
                    'confidence': float(conf)
                }, room=sid)
                
                print(f"[{sid}] 예측 성공: {predicted_action} ({conf:.2f}) -> 시퀀스를 초기화합니다.")
                seq.clear()

# --- Flask 라우트 및 SocketIO 이벤트 핸들러 ---
@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    print(f"클라이언트 연결됨: {request.sid}")
    emit('status', {'message': '서버 연결 성공!'})

@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    if sid in user_sequences:
        del user_sequences[sid]
        print(f"클라이언트 연결 끊어짐: {sid}. 해당 사용자의 시퀀스 데이터를 삭제했습니다.")
    else:
        print(f"클라이언트 연결 끊어짐: {sid}.")

# [핵심 변경 2] 'process_frame' 핸들러는 이제 매우 가벼워짐
@socketio.on('process_frame')
def handle_process_frame(data):
    """
    클라이언트로부터 프레임을 받아서, 무거운 작업은 백그라운드에 넘깁니다.
    이 함수는 즉시 반환되므로 서버가 멈추지 않습니다.
    """
    img = data_uri_to_cv2_img(data['image'])
    if img is not None:
        # socketio.start_background_task를 사용하여 작업을 위임
        socketio.start_background_task(
            target=process_image_and_predict, 
            sid=request.sid, 
            img=img
        )

# --- 메인 실행 블록 ---
if __name__ == '__main__':
    if not initialize_detector_and_model():
        print("모델 초기화에 실패했습니다. 프로그램을 종료합니다.")
        exit(1)
    
    print("AI 서버가 시작되었습니다. 클라이언트의 연결을 기다립니다...")
    
    socketio.run(app, host='0.0.0.0', port=5000)
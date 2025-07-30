import React from 'react';
import Webcam from 'react-webcam';

const FeaturePage = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8bbd0 0%, #e7c6ff 100%)',
        padding: '32px 0',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <h2 style={{ fontSize: 32, marginBottom: 24 }}>실시간 수어 통역</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: 32,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 8px #e7c6ff',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 350,
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 12 }}>웹캠화면</div>
            <div style={{ marginBottom: 12 }}>
              <button
                style={{
                  background: '#f3e8ff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '6px 18px',
                  fontWeight: 500,
                  fontSize: 15,
                  marginRight: 8,
                }}
              >
                카메라
              </button>
              <input type="checkbox" checked readOnly style={{ accentColor: '#d291bc' }} />
            </div>
            <div
              style={{
                background: '#f4f6fa',
                borderRadius: 12,
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 180,
                border: '1.5px solid #e0e0e0',
              }}
            >
              <Webcam
                audio={false}
                height={180}
                width={320}
                style={{ border: 'none', background: 'transparent' }}
                screenshotFormat="image/jpeg"
              />
            </div>
            <div style={{ color: '#aaa', fontSize: 15, textAlign: 'center', marginTop: 12 }}>
              녹화 시작 버튼을 눌러주세요
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 8px #e7c6ff',
              padding: 24,
              minHeight: 350,
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 12 }}>번역된 문장</div>
            <div style={{ minHeight: 180, fontSize: 18, color: '#444' }}>
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 8px #e7c6ff',
              padding: 24,
              minHeight: 180,
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 12 }}>현재 인식된 단어</div>
            <div style={{ fontSize: 16, color: '#444' }}>
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 8px #e7c6ff',
              padding: 24,
              minHeight: 180,
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 12 }}>사용 팁</div>
            <ul style={{ paddingLeft: 18, fontSize: 15, color: '#444', margin: 0 }}>
              <li style={{ marginBottom: 6, color: '#d291bc' }}>
                <span style={{ color: '#d291bc', marginRight: 6 }}>●</span>
                카메라와 1-2미터 거리를 유지해주세요.
              </li>
              <li style={{ marginBottom: 6 }}>
                <span style={{ color: '#d291bc', marginRight: 6 }}>●</span>
                충분한 조명이 있는 곳에서 사용해주세요.
              </li>
              <li style={{ marginBottom: 6 }}>
                <span style={{ color: '#d291bc', marginRight: 6 }}>●</span>
                손과 팔이 화면에 잘 보이도록 해주세요.
              </li>
              <li>
                <span style={{ color: '#d291bc', marginRight: 6 }}>●</span>
                천천히 수어해주세요.
              </li>
            </ul>
          </div>
        </div>
      </div>
      <style>
        {`
          ::-webkit-scrollbar { display: none; }
          html { scroll-behavior: smooth; }
        `}
      </style>
    </div>
  );
};

export default FeaturePage;
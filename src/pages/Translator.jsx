import React from 'react';
import Header from '../components/Header/Header';
import styled from 'styled-components';

const TranslatorContainer = styled.div`
  background: linear-gradient(180deg, #fce4ec 0%, #f48fb1 100%);
  min-height: 100vh;
  padding-top: 80px; /* 헤더 높이만큼 패딩 */
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  text-align: left;
  margin-bottom: 2rem;
  color: #333;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: auto auto;
  gap: 1.5rem;
`;

const GridItem = styled.div`
  background: rgba(255, 255, 255, 0.7);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);

  h3 {
    text-align: left;
    margin-top: 0;
    margin-bottom: 1rem;
    color: #555;
  }
`;

const WebcamArea = styled(GridItem)`
  grid-row: span 2;
  display: flex;
  flex-direction: column;

  .webcam-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .camera-toggle {
    display: flex;
    align-items: center;
    font-size: 0.9rem;
  }

  .webcam-placeholder {
    flex-grow: 1;
    background-color: #e9ecef;
    border-radius: 15px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #868e96;

    .icon { font-size: 4rem; }
    p { margin-top: 1rem; }
  }
`;

const TranslatedTextArea = styled(GridItem)``;
const RecognizedWordArea = styled(GridItem)``;

const TipsArea = styled(GridItem)`
  ul {
    padding-left: 1.5rem;
    margin: 0;
    text-align: left;
    color: #666;
  }
  li {
    margin-bottom: 0.75rem;
  }
`;


const Translator = () => {
  return (
    <TranslatorContainer>
      <Header />
      <ContentWrapper>
        <PageTitle>실시간 수어 통역</PageTitle>
        <GridContainer>
          <WebcamArea>
            <div className="webcam-header">
              <h3>웹캠 화면</h3>
              <div className="camera-toggle">
                카메라 <input type="checkbox" defaultChecked />
              </div>
            </div>
            <div className="webcam-placeholder">
              <span className="icon">📷</span>
              <p>녹화 시작 버튼을 눌러주세요</p>
            </div>
          </WebcamArea>
          
          <TranslatedTextArea>
            <h3>번역된 문장</h3>
          </TranslatedTextArea>

          <RecognizedWordArea>
             <h3>현재 인식된 단어</h3>
          </RecognizedWordArea>

          <TipsArea>
            <h3>사용 팁</h3>
            <ul>
              <li>카메라와 1-2미터 거리를 유지해주세요.</li>
              <li>충분한 조명이 있는 곳에서 사용해주세요.</li>
              <li>손과 팔이 화면에 잘 보이도록 찍주세요.</li>
              <li>천천히 수어해주세요.</li>
            </ul>
          </TipsArea>
        </GridContainer>
      </ContentWrapper>
    </TranslatorContainer>
  );
};

export default Translator;
import React from 'react';
import { Link } from 'react-router-dom';

const dongleFontLink = document.createElement('link');
dongleFontLink.href = 'https://fonts.googleapis.com/css2?family=Dongle&display=swap';
dongleFontLink.rel = 'stylesheet';
document.head.appendChild(dongleFontLink);

const MainPage = () => {
  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #e7c6ff 0%, #f8bbd0 100%)',
      overflowX: 'hidden',
      scrollBehavior: 'smooth'
    }}>
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 40px', background: 'transparent'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Gugi', fontSize: 32, color: '#d291bc', marginRight: 8 }}>손짓</span>
          <img src="/front_hand.png" alt="손 아이콘" style={{ width: 36, height: 36, verticalAlign: 'middle' }} />
        </div>
        <div>
          <Link to="/" style={{ marginRight: 16 }}>홈</Link>
          <Link to="/feature" style={{ marginRight: 16 }}>수어통역</Link>
          <Link to="/settings">설정</Link>
        </div>
      </nav>

      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center', background: '#fdfbe6'
      }}>
        <div style={{ fontFamily: 'Dongle, sans-serif', fontSize: '7vw', marginBottom: 24 }}>
          당신의
          <span style={{ fontFamily: 'Gugi', fontSize: '5vw',color: '#d291bc' }}>손짓</span>
          을<br />세상과 잇다
        </div>
        <div>
          <button style={{
            background: '#ffb9b3', border: 'none', borderRadius: 20, padding: '18px 36px',
            fontSize: 20, marginRight: 24, boxShadow: '0 2px 8px #e7c6ff'
          }}>손짓 연결하기</button>
          <button style={{
            background: '#ffb9b3', border: 'none', borderRadius: 20, padding: '18px 36px',
            fontSize: 20, boxShadow: '0 2px 8px #e7c6ff'
          }}>더 알아보기</button>
        </div>
      </section>

      <section style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', background: 'linear-gradient(180deg, #e7c6ff 0%, #f8bbd0 100%)'
      }}>
        <h2 style={{ fontSize: 32, margin: 32 }}>따뜻한 기술로 만드는 소통의 다리</h2>
        <p style={{ fontSize: 18, color: '#888', marginBottom: 40 }}>
          최신 AI 기술을 활용하여 수어를 실시간으로 인식하고 번역합니다.<br />
          청각장애인과 비장애인 모두가 편안하게 대화할 수 있는 환경을 제공합니다.
        </p>
        <div style={{ display: 'flex', gap: 40 }}>
          <div style={{
            background: '#fff6fb', borderRadius: 20, padding: 32, minWidth: 220, textAlign: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✋</div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>정확한 인식</div>
            <div style={{ color: '#666' }}>고도화된 AI모델로 다양한 수어 동작을 정확하게 인식합니다.</div>
          </div>
          <div style={{
            background: '#fff6fb', borderRadius: 20, padding: 32, minWidth: 220, textAlign: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>실시간 번역</div>
            <div style={{ color: '#666' }}>지연 없이 즉시 텍스트와 음성으로 변환하여 자연스러운 대화를 돕습니다.</div>
          </div>
          <div style={{
            background: '#fff6fb', borderRadius: 20, padding: 32, minWidth: 220, textAlign: 'center'
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>접근성 우선</div>
            <div style={{ color: '#666' }}>모든 사용자가 쉽게 이용할 수 있는 인터페이스를 제공합니다.</div>
          </div>
        </div>
      </section>

      <section style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', background: 'linear-gradient(180deg, #f8bbd0 0%, #e7c6ff 100%)'
      }}>
        <h2 style={{ fontSize: 28, margin: 32 }}>간단한 3단계로 시작하세요</h2>
        <div style={{ display: 'flex', gap: 60, marginTop: 32 }}>
          <div style={{ textAlign: 'center', maxWidth: 220 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', background: '#fff6fb',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: 48
            }}>📷</div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>웹캠 켜기</div>
            <div style={{ color: '#666', fontSize: 15 }}>브라우저에서 카메라 권한을 허용하고 웹캠을 활성화하세요.</div>
          </div>
          <div style={{ fontSize: 48, alignSelf: 'center' }}>➔</div>
          <div style={{ textAlign: 'center', maxWidth: 220 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', background: '#fff6fb',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: 48
            }}>🧑‍🤝‍🧑</div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>수어하기</div>
            <div style={{ color: '#666', fontSize: 15 }}>카메라 앞에서 자연스럽게 수어로 대화하세요.</div>
          </div>
          <div style={{ fontSize: 48, alignSelf: 'center' }}>➔</div>
          <div style={{ textAlign: 'center', maxWidth: 220 }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%', background: '#fff6fb',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: 48
            }}>📝</div>
            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>대화 확인하기</div>
            <div style={{ color: '#666', fontSize: 15 }}>실시간으로 번역된 텍스트와 음성을 확인하세요.</div>
          </div>
        </div>
      </section>

      <section style={{
        minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', background: 'linear-gradient(180deg, #e7c6ff 0%, #f8bbd0 100%)'
      }}>
        <h2 style={{ fontSize: 28, margin: 32 }}>사용자들의 따뜻한 이야기</h2>
        <div style={{ display: 'flex', gap: 40 }}>
          <div style={{
            background: '#fff6fb', borderRadius: 20, padding: 32, minWidth: 320, maxWidth: 400
          }}>
            <div style={{ fontSize: 18, marginBottom: 16 }}>
              “지하철에서 청각장애인 분과 소통할 수 있었어요.<br />
              정말 신기하고 감동적인 경험이었습니다.”
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
              <img src="https://randomuser.me/api/portraits/women/1.jpg" alt="user" style={{
                width: 36, height: 36, borderRadius: '50%', marginRight: 12
              }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 15 }}>이○○님</div>
                <div style={{ fontSize: 13, color: '#888' }}>대학생</div>
              </div>
            </div>
          </div>
          <div style={{
            background: '#fff6fb', borderRadius: 20, padding: 32, minWidth: 320, maxWidth: 400
          }}>
            <div style={{ fontSize: 18, marginBottom: 16 }}>
              병원에서 의료진과 소통하는데 정말 도움이 되었어요.<br />
              빠르고 정확한 번역에 감사드립니다.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
              <img src="https://randomuser.me/api/portraits/women/2.jpg" alt="user" style={{
                width: 36, height: 36, borderRadius: '50%', marginRight: 12
              }} />
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 15 }}>이○○님</div>
                <div style={{ fontSize: 13, color: '#888' }}>직장인</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>
        {`
          ::-webkit-scrollbar { display: none; }
          html { scroll-behavior: smooth; }
        `}
      </style>
    </div>
  );
};

export default MainPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './FinalCTA.css';

const FinalCTA = ({ onNavigateToTop }) => {
  const navigate = useNavigate();

  const handleNavigateToTranslator = () => {
    navigate('/translator');
  };

  return (
    <section className="final-cta-section">
      <div className="button-group">
        <button className="btn-primary" onClick={handleNavigateToTranslator}>
          손짓 연결하기
        </button>
        <button className="btn-secondary" onClick={onNavigateToTop}>
          처음으로
        </button>
      </div>
    </section>
  );
};

export default FinalCTA;
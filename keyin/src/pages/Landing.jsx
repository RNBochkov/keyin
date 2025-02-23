import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './Landing.css';

function Landing() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleStartClick = () => {
    setStep(1);
  };

  const handleAgreeInstruction = async () => {
    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      setStep(2);
    } catch (error) {
      alert("Необходимо разрешить доступ к геолокации для продолжения.");
    }
  };

  return (
    <div className="landing-container">
      
      {/* Эффект прожектора */}
{step == 2 && (
        <div className="spotlight-overlay">
          <div className="spotlight-beam"></div>
        </div>
      )}

      <div className="game-title">SamaraGOroad</div>

      <div className={`overlay ${step >= 1 ? 'blurred' : ''}`}>
        <h1 className="title">Тайны Самары</h1>
        <p className="subtitle">
          Это приложение создано, чтобы разнообразить ваши прогулки по городу. 
          Исследуйте скрытые уголки Самары, открывайте новые места и погружайтесь 
          в атмосферу интерактивного расследования.
        </p>
        <p className="subtitle">
    Следуй за уликами и открывай неизведанное — 
    каждая улица может хранить свою тайну.
  </p>
        <button className="start-button" onClick={handleStartClick}>
          Начать расследование
        </button>
      </div>

      {step === 1 && (
        <div className="instruction-modal spotlight-target">
          <h2>Внимание!</h2>
          <p>
            Будьте осторожны при использовании телефона во время прогулки. 
            Следите за дорогой и окружающими.
          </p>
          <button className="agree-button" onClick={handleAgreeInstruction}>
            Разрешить геолокацию
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="instruction-modal spotlight-target">
          <h2>Вы готовы начать расследование!</h2>
          <p>
            Не забывайте наслаждаться красотой Самары — заглядывайте в 
            неизведанные уголки, делайте фото на память.
          </p>
          <button className="agree-button" onClick={() => navigate("/samaragoroad")}>
            Погрузиться в расследование
          </button>
        </div>
      )}
    </div>
  );
}

export default Landing;
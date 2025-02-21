import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Landing.css'; // Подключение стилей

function Landing() {
  const [step, setStep] = useState(0); // 0 - нет модалки, 1 - инструкция, 2 - геолокация
  const navigate = useNavigate();

  const handleStartClick = () => {
    setStep(1); // Показываем инструкцию
  };

  const handleAgreeInstruction = async () => {
    try {
      // Запрашиваем геолокацию
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      setStep(2); // Успешно, переходим к следующему шагу
    } catch (error) {
      alert("Необходимо разрешить доступ к геолокации для продолжения.");
    }
  };

  return (
    <div className="landing-container">
      <div className="game-title">SavaraGOroad</div> {/* Название игры */}

      <div className="overlay">
        <h1 className="title">Тайны Самары</h1>
        <p className="subtitle">
          Интерактивное расследование по улицам города. Следуй за уликами, разгадывай загадки, открой правду.
        </p>
        <button className="start-button" onClick={handleStartClick}>
          Начать расследование
        </button>
      </div>

      {/* Модальные окна */}
      {step === 1 && (
        <div className="instruction-modal">
          <h2>Внимание!</h2>
          <p>
            Будьте осторожны при использовании телефона во время прогулки. Следите за дорогой и окружающими.
          </p>
          <p>
            Для продолжения необходимо разрешить использование геолокации.
          </p>
          <button className="agree-button" onClick={handleAgreeInstruction}>
            Разрешить геолокацию
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="instruction-modal">
          <h2>Готово!</h2>
          <p>Теперь вы готовы начать расследование по улицам города!</p>
          <button className="agree-button" onClick={() => navigate("/samaragoroad")}>
            Начать игру
          </button>
        </div>
      )}
    </div>
  );
}

export default Landing;

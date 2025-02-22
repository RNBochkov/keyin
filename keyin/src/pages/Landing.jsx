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
      <div className="game-title">SamaraGOroad</div> {/* Название игры */}

      <div className="overlay">
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

      {/* Модальные окна */}
      {step === 1 && (
        <div className="instruction-modal">
          <h2>Внимание!</h2>
          <p>
            Будьте осторожны при использовании телефона во время прогулки. Следите за дорогой и окружающими.
          </p>
          <p>
  Чтобы создать уникальный опыт и направить вас по маршруту расследования, нам потребуется доступ к вашей геолокации. Это позволит отслеживать ваше продвижение по городу и подсказывать, где искать следующие улики.
</p>
          <button className="agree-button" onClick={handleAgreeInstruction}>
            Разрешить геолокацию
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="instruction-modal">
          <h2>Вы готовы начать расследование!</h2>
          <p>
            Не забывайте наслаждаться красотой Самары — заглядывайте в неизведанные уголки, делайте фото на память.
          </p>
          <p>
            Но помните, вы — детектив. Ваша цель раскрыть дело, следуя за уликами, которые приведут вас к истине.
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

import React from "react";
import "./Tutorial.css"; // Создайте файл стилей для компонента Tutorial

const Tutorial = ({ onClose }) => {
  return (
    <div className="tutorial-overlay">
      <div className="tutorial-circle">
        <div className="tutorial-content">
          <p>Это ваше местоположение</p>
          <button onClick={onClose}>Понял</button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;

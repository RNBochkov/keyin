import React from "react";
import "./Tutorial.css"; // Создайте файл стилей для компонента Tutorial

const Tutorial = ({ onClose, text, buttonPosition }) => {
  return (
    <div className="tutorial-overlay">
      <div
        className="tutorial-circle"
        style={{
          top:
            buttonPosition === "controls-container"
              ? "calc(82%)"
              : "calc(50% - 40vw)"
        }}
      >
        <div
          className="tutorial-content"
          
        >
          <p>{text}</p>
          <button onClick={onClose}>Понял</button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;

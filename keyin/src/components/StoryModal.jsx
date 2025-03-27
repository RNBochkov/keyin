import { useEffect, useState, useRef } from "react";
import storyData from "../data/story.json";
import "./StoryModal.css";

const backgrounds = import.meta.glob("../assets/backgrounds/*", { eager: true });
const characters = import.meta.glob("../assets/characters/*", { eager: true });

const StoryModal = ({ currentPointId, onClose }) => {
  const [story, setStory] = useState(null);
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef(null);

  // Сброс состояния при изменении точки квеста
  useEffect(() => {
    const currentStory = storyData.find((item) => item.id === currentPointId);
    setStory(currentStory);
    setTextIndex(0);
    setCurrentText("");
    setIsTyping(false);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentPointId]);

  // Запуск анимации текста при изменении индекса
  useEffect(() => {
    if (story && !isTyping) {
      setCurrentText("");
      typeText();
    }
  }, [story, textIndex]);

  // Анимация печати текста
  const typeText = () => {
    if (!story || textIndex >= story.text.length) return;

    setIsTyping(true);
    const fullText = story.text[textIndex];
    let i = 0;
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setCurrentText(fullText.slice(0, i + 1));
      if (i >= fullText.length - 1) {
        clearInterval(intervalRef.current);
        setIsTyping(false);
      }
      i++;
    }, 30);
  };

  // Обработчик клика по кнопке
  const handleNextText = () => {
    if (isTyping) {
      // Показать весь текст сразу
      clearInterval(intervalRef.current);
      setCurrentText(story.text[textIndex]);
      setIsTyping(false);
    } else {
      // Переход к следующему тексту или закрытие
      if (textIndex < story.text.length - 1) {
        setTextIndex(prev => prev + 1);
      } else {
        onClose();
      }
    }
  };

  // Рендеринг интерфейса
  if (!story) return null;

  const isColorBackground = story.background.includes("rgba") || story.background.includes("#");
  const backgroundSrc = !isColorBackground 
    ? backgrounds[`../assets/backgrounds/${story.background}`]?.default 
    : null;
    
  const backgroundStyle = isColorBackground
    ? { backgroundColor: story.background }
    : { 
        backgroundImage: `url(${backgroundSrc})`, 
        backgroundSize: "cover", 
        backgroundPosition: "center" 
      };

  const characterSrc = characters[`../assets/characters/${story.character}`]?.default;

  return (
    <div className="story-modal" style={backgroundStyle}>
      {characterSrc && (
        <div className="character-container">
          <img 
            className="character" 
            src={characterSrc} 
            alt={story.characterName} 
            style={{ animation: isTyping ? "bounce 0.5s infinite" : "none" }}
          />
        </div>
      )}

      <div className="dialog-box">
        <div className="character-name">{story.characterName}</div>
        <p className="typing-text">{currentText}</p>
        <button 
          className={`continue-button ${isTyping ? "skippable" : ""}`}
          onClick={handleNextText}
        >
          {isTyping ? "▶ Пропустить" : "▶ Продолжить"}
        </button>
      </div>
    </div>
  );
};

export default StoryModal;
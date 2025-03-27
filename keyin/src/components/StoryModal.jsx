import { useEffect, useState, useRef } from "react";
import storyData from "../data/story.json";
import "./StoryModal.css";

const backgrounds = import.meta.glob("../assets/backgrounds/*", { eager: true });
const characters = import.meta.glob("../assets/characters/*", { eager: true });

const KARMA_STORAGE_KEY = "questKarma";

const StoryModal = ({ currentPointId, onClose }) => {
  const [story, setStory] = useState(null);
  const [currentText, setCurrentText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const intervalRef = useRef(null);
  
  // Инициализация кармы из localStorage
  const [karma, setKarma] = useState(() => {
    const saved = localStorage.getItem(KARMA_STORAGE_KEY);
    return saved ? parseInt(saved) : 0;
  });

  // Сохранение кармы при изменении
  useEffect(() => {
    localStorage.setItem(KARMA_STORAGE_KEY, karma.toString());
  }, [karma]);

  // Сброс состояния при изменении точки
  useEffect(() => {
    const currentStory = storyData.find((item) => item.id === currentPointId);
    setStory(currentStory);
    setTextIndex(0);
    setCurrentText("");
    setIsTyping(false);
    setShowChoices(false);
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentPointId]);

  // Обработка текущего шага в истории
  useEffect(() => {
    if (!story) return;

    const currentStep = story.text[textIndex];
    
    if (typeof currentStep === 'string') {
      setShowChoices(false);
      typeText(currentStep);
    } else if (currentStep?.question) {
      setShowChoices(true);
      setIsTyping(false);
    }
  }, [story, textIndex]);

  // Анимация печати текста
  const typeText = (text) => {
    setIsTyping(true);
    let i = 0;
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setCurrentText(text.slice(0, i + 1));
      if (i >= text.length - 1) {
        clearInterval(intervalRef.current);
        setIsTyping(false);
      }
      i++;
    }, 30);
  };

  // Обработчик выбора ответа
  const handleChoice = (selectedKarma) => {
    setKarma(prev => prev + selectedKarma);
    setShowChoices(false);
    setTextIndex(prev => prev + 1);
  };

  // Обработчик продолжения/пропуска
  const handleNextText = () => {
    if (isTyping) {
      clearInterval(intervalRef.current);
      setCurrentText(story.text[textIndex]);
      setIsTyping(false);
      return;
    }

    if (textIndex < story.text.length - 1) {
      setTextIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  if (!story) return null;

  const currentStep = story.text[textIndex];
  const isChoiceStep = typeof currentStep === 'object' && currentStep.question;
  const isColorBackground = story.background.includes("rgba") || story.background.includes("#");
  const backgroundSrc = !isColorBackground 
    ? backgrounds[`../assets/backgrounds/${story.background}`]?.default 
    : null;
  const characterSrc = characters[`../assets/characters/${story.character}`]?.default;

  const backgroundStyle = isColorBackground
    ? { backgroundColor: story.background }
    : { 
        backgroundImage: `url(${backgroundSrc})`, 
        backgroundSize: "cover", 
        backgroundPosition: "center" 
      };

  return (
    <div className="story-modal" style={backgroundStyle}>
      {/* Индикатор кармы */}
      <div className="karma-display">
        <div className="karma-bar">
          <div 
            className="karma-progress" 
            style={{ width: `${((karma + 10)/20)*100}%` }}
          />
          <span className="karma-value">{karma}</span>
        </div>
        <button 
          className="reset-karma-button"
          onClick={() => {
            localStorage.removeItem(KARMA_STORAGE_KEY);
            setKarma(0);
          }}
          title="Сбросить прогресс"
        >
          ⟳
        </button>
      </div>

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
        
        {isChoiceStep ? (
          <div className="choices-container">
            <h3 className="question-text">{currentStep.question}</h3>
            {currentStep.choices.map((choice, index) => (
              <button 
                key={index}
                className="choice-button"
                onClick={() => handleChoice(choice.karma)}
              >
                {choice.text}
              </button>
            ))}
          </div>
        ) : (
          <>
            <p className="typing-text">{currentText}</p>
            <button 
              className={`continue-button ${isTyping ? "skippable" : ""}`}
              onClick={handleNextText}
            >
              {isTyping ? "▶ Пропустить" : "▶ Продолжить"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default StoryModal;
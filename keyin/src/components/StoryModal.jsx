import { useEffect, useState } from "react";
import storyData from "../data/story.json";
import "./StoryModal.css";

// Динамический импорт изображений
const backgrounds = import.meta.glob("../assets/backgrounds/*", { eager: true });
const characters = import.meta.glob("../assets/characters/*", { eager: true });

const StoryModal = ({ currentPointId, onClose }) => {
  const [story, setStory] = useState(null);
  const [currentText, setCurrentText] = useState(""); 
  const [textIndex, setTextIndex] = useState(0); 
  const [charIndex, setCharIndex] = useState(0); 
  const [isTyping, setIsTyping] = useState(false); 

  useEffect(() => {
    const currentStory = storyData.find((item) => item.id === currentPointId);
    setStory(currentStory);
    setTextIndex(0);
    setCharIndex(0);
    setCurrentText("");
    setIsTyping(false);
  }, [currentPointId]);

  useEffect(() => {
    if (story && !isTyping) {
      setCurrentText("");
      setCharIndex(0);
      typeText();
    }
  }, [story, textIndex]);

  const typeText = () => {
    if (!story || textIndex >= story.text.length) return;
  
    setIsTyping(true);
    const fullText = story.text[textIndex];
  
    let i = 0;
    const interval = setInterval(() => {
      setCurrentText(fullText.slice(0, i + 1)); 
  
      if (i >= fullText.length - 1) {
        clearInterval(interval);
        setIsTyping(false);
      }
      i++;
    }, 50);
  };

  const handleNextText = () => {
    if (isTyping) return;
    if (textIndex < story.text.length - 1) {
      setTextIndex(textIndex + 1);
      setCurrentText("");
    } else {
      onClose(); 
    }
  };

  if (!story) return null;

  
  const isColorBackground = story.background.includes("rgba") || story.background.includes("#");
  const backgroundSrc = !isColorBackground ? backgrounds[`../assets/backgrounds/${story.background}`]?.default : null;

  const backgroundStyle = isColorBackground
    ? { backgroundColor: story.background }
    : { backgroundImage: `url(${backgroundSrc})`, backgroundSize: "cover", backgroundPosition: "center" };

  
  const characterSrc = characters[`../assets/characters/${story.character}`]?.default;

  return (
    <div className="story-modal" style={backgroundStyle}>
      {/* Персонаж (верхняя 50% экрана) */}
      {characterSrc && (
        <div className="character-container">
          <img className="character" src={characterSrc} alt={story.characterName} />
        </div>
      )}

      {/* Диалоговое окно (нижняя 50% экрана) */}
      <div className="dialog-box">
        {/* Имя персонажа */}
        <div className="character-name">{story.characterName}</div>

        {/* Постепенно печатаемый текст */}
        <p className="typing-text">{currentText}</p>

        {/* Кнопка продолжить */}
        <button className="close-button" onClick={handleNextText}>Продолжить</button>
      </div>
    </div>
  );
};

export default StoryModal;

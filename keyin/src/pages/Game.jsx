import GameMap from "../components/GameMap";
import { useState, useEffect } from "react";
import "./Game.css";
import pointsData from "../data/points.json";
import StoryModal from "../components/StoryModal";
import Tutorial from "../components/Tutorial";

// Функция проверки расстояния до точки
const checkDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// Функция генерации случайной точки
const getRandomNearbyPoint = (lat, lon, radius = 0.0005) => {
  const randomOffset = () => (Math.random() - 0.5) * radius * 2;
  return [lat + randomOffset(), lon + randomOffset()];
};

function Game() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [generatedPoint, setGeneratedPoint] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isNearPoint, setIsNearPoint] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(true);
  const [animateMarker, setAnimateMarker] = useState(false);
  const [zoomTrigger, setZoomTrigger] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const maxDistance = 100;

  // Загрузка данных из локал стораджа
  useEffect(() => {
    const savedHistory = localStorage.getItem("pointsHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    const savedIndex = localStorage.getItem("currentIndex");
    if (savedIndex) {
      setCurrentIndex(parseInt(savedIndex, 10));
    }

    const savedGeneratedPoint = localStorage.getItem("generatedPoint");
    if (savedGeneratedPoint) {
      setGeneratedPoint(JSON.parse(savedGeneratedPoint));
    }

    setIsLoaded(true);
  }, []);

  // Создание первой рандомной точки
  useEffect(() => {
    if (isLoaded && !generatedPoint && currentIndex === 0) {
      const savedLocation = localStorage.getItem("userLocation");

      if (savedLocation) {
        const { lat, lon } = JSON.parse(savedLocation);
        const newPoint = {
          id: 0,
          text: "Случайная стартовая точка",
          coordinates: getRandomNearbyPoint(lat, lon),
        };
        setGeneratedPoint(newPoint);
        localStorage.setItem("generatedPoint", JSON.stringify(newPoint));
      }
    }
  }, [isLoaded, generatedPoint, currentIndex]);

  // Вызов проверки на близость к точке
  useEffect(() => {
    const checkUserProximity = () => {
      const savedLocation = localStorage.getItem("userLocation");
      if (!savedLocation) return;

      const { lat, lon } = JSON.parse(savedLocation);
      const userCoords = [lat, lon];

      const currentPoint =
        currentIndex === 0 ? generatedPoint : pointsData[currentIndex - 1];

      if (currentPoint) {
        const distance = checkDistance(
          ...userCoords,
          ...currentPoint.coordinates
        );
        setIsNearPoint(distance <= maxDistance);
      }
    };

    checkUserProximity(); // Проверяем сразу при загрузке
    const interval = setInterval(checkUserProximity, 2000);

    return () => clearInterval(interval);
  }, [isLoaded, generatedPoint, currentIndex]);

  // Обработчик нажатия кнопки для отображения истории и следующей точки
  const handleNextPoint = () => {
    if (!isNearPoint) return;
    setIsNearPoint(false);
    setIsStoryOpen(true); // Открываем модалку с историей

    const currentPoint =
      currentIndex === 0 ? generatedPoint : pointsData[currentIndex - 1];

    if (!currentPoint) return;

    const newHistory = [
      ...history,
      { id: currentPoint.id, text: currentPoint.text },
    ];

    setHistory(newHistory);
    localStorage.setItem("pointsHistory", JSON.stringify(newHistory));

    if (currentIndex === 0) {
      localStorage.removeItem("generatedPoint");
      setGeneratedPoint(null);
    }

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    localStorage.setItem("currentIndex", newIndex);

    setTimeout(() => {
      setAnimateMarker(false); // Помечаем точку пройденной, скрываем маркер
    }, 1000);
  };

  // Функция сброса состояния игры
  const resetGame = () => {
    setCurrentIndex(0);
    setHistory([]);
    setGeneratedPoint(null);
    setIsNearPoint(false);
    setAnimateMarker(false);
    setIsHistoryOpen(false);
    setZoomTrigger(false);
    setIsStoryOpen(true);
    localStorage.removeItem("pointsHistory");
    localStorage.removeItem("currentIndex");
    localStorage.removeItem("generatedPoint");
  };

  const currentPoint =
    currentIndex === 0 ? generatedPoint : pointsData[currentIndex - 1];

  return (
    <div className="game-container">
      {isStoryOpen && currentPoint && (
        <StoryModal
          currentPointId={currentIndex}
          onClose={() => {
            setIsStoryOpen(false);
            setZoomTrigger(true); // Запускаем зум, но НЕ появление маркера
            if (currentIndex === 0) {
              setIsTutorialOpen(true); // Открываем обучение после первого окна сюжетной истории
            }
          }}
        />
      )}

      {isTutorialOpen && <Tutorial onClose={() => setIsTutorialOpen(false)} />}

      {currentPoint && (
        <GameMap
          currentPoint={currentPoint}
          animateMarker={animateMarker}
          zoomTrigger={zoomTrigger}
          resetZoom={() => {
            setZoomTrigger(false);
            setAnimateMarker(true); // После завершения зума запускаем анимацию маркера
          }}
        />
      )}

      <div className="controls-container">
        {isNearPoint ? (
          <button className="map-button" onClick={handleNextPoint}>
            Узнать историю
          </button>
        ) : (
          <p className="info-text">
            Пройдите до следующей точки для продолжения сюжета
          </p>
        )}

        {history.length > 0 && (
          <button className="map-button" onClick={() => setIsHistoryOpen(true)}>
            История
          </button>
        )}
      </div>

      {isHistoryOpen && (
        <div className="history-modal">
          <div className="modal-header">
            <h3>История точек</h3>
            <button onClick={() => setIsHistoryOpen(false)}>×</button>
          </div>

          {history.length === 0 ? (
            <p>Нет сохраненных точек</p>
          ) : (
            <ul className="history-list">
              {history.map((item) => (
                <li key={item.id} className="history-item">
                  {item.text}
                </li>
              ))}
            </ul>
          )}
          <button className="reset-button" onClick={resetGame}>
            Начать заново
          </button>
        </div>
      )}

      {isHistoryOpen && <div className="modal-overlay" />}
    </div>
  );
}

export default Game;

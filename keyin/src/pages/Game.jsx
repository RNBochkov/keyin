import GameMap from "../components/GameMap";
import { useState, useEffect } from 'react';
import "./Game.css"
import pointsData from "../data/points.json";

// const pointsData = [
//   { id: 1, text: 'Дом родимый дом', coordinates: [53.2248388, 50.2708778]},
//   { id: 2, text: 'Сюда нам надо', coordinates: [53.1860722, 50.0927639] },
//   { id: 3, text: 'Точка 2', coordinates: [53.210, 50.120] },
// ];

const checkDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
};

// Генерация случайной точки рядом с текущим местоположением
const getRandomNearbyPoint = (lat, lon, radius = 0.0005) => {
  const randomOffset = () => (Math.random() - 0.5) * radius * 2; // Генерация смещения в пределах radius
  return [lat + randomOffset(), lon + randomOffset()];
};

function Game() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [generatedPoint, setGeneratedPoint] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isNearPoint, setIsNearPoint] = useState(false);
  const maxDistance = 100;

  // Загрузка истории и текущего индекса
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

    setIsLoaded(true); // Даем сигнал, что данные загружены
  }, []);

  // Генерация первой точки, если её нет в `localStorage`
  useEffect(() => {
    if (isLoaded && !generatedPoint && currentIndex === 0) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPoint = {
            id: 0,
            text: "Случайная стартовая точка",
            coordinates: getRandomNearbyPoint(
              position.coords.latitude,
              position.coords.longitude
            ),
          };
          setGeneratedPoint(newPoint);
          localStorage.setItem("generatedPoint", JSON.stringify(newPoint));
        },
        (error) => {
          console.error("Ошибка получения геолокации:", error);
        }
      );
    }
  }, [isLoaded, generatedPoint, currentIndex]);

  useEffect(() => {
    const checkUserProximity = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const userCoords = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        const currentPoint = currentIndex === 0 ? generatedPoint : pointsData[currentIndex - 1];

        if (currentPoint) {
          const distance = checkDistance(...userCoords, ...currentPoint.coordinates);
          setIsNearPoint(distance <= maxDistance);
        }
      } catch (error) {
        console.error("Ошибка получения геолокации:", error);
      }
    };

    const interval = setInterval(checkUserProximity, 2000); // Проверять каждые 5 секунд

    return () => clearInterval(interval);
  }, [isLoaded, generatedPoint, currentIndex]);

  const handleNextPoint = () => {
    if (!isNearPoint) return;

    setIsNearPoint(false);

    const currentPoint = currentIndex === 0 ? generatedPoint : pointsData[currentIndex - 1];

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
  };

  const currentPoint = currentIndex === 0 ? generatedPoint : pointsData[currentIndex - 1];

    return (
    <div className="game-container">
      {currentPoint && <GameMap currentPoint={currentPoint} />}

      <div className="controls-container">
        {isNearPoint ? (
          <button className="map-button" onClick={handleNextPoint}>
            Узнать историю
          </button>
        ) : (
          <p className="info-text">Пройдите до следующей точки для продолжения сюжета</p>
        )}
        
        <button className="map-button" onClick={() => setIsHistoryOpen(true)}>
          История
        </button>
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
              {history.map(item => (
                <li key={item.id} className="history-item">
                  {item.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {isHistoryOpen && <div className="modal-overlay" />}
    </div>
    );
}
export default Game;
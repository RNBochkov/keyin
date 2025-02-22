import GameMap from "../components/GameMap";
import { useState, useEffect } from 'react';
import "./Game.css"

const points = [
  { id: 1, text: 'Дом родимый дом', coordinates: [53.2248388, 50.2708778]},
  { id: 2, text: 'Сюда нам надо', coordinates: [53.1860722, 50.0927639] },
  { id: 3, text: 'Точка 2', coordinates: [53.210, 50.120] },
];

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

function Game() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const maxDistance = 100;

  useEffect(() => {
    const savedHistory = localStorage.getItem('pointsHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleNextPoint = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const userCoords = [
        position.coords.latitude,
        position.coords.longitude
      ];

      const currentPoint = points[currentIndex];
      const distance = checkDistance(...userCoords, ...currentPoint.coordinates);

      if (distance <= maxDistance) {
        const newHistory = [...history, {
          id: currentPoint.id,
          text: currentPoint.text
        }];
        
        setHistory(newHistory);
        localStorage.setItem('pointsHistory', JSON.stringify(newHistory));
        setCurrentIndex(prev => prev + 1);
      }
      else {
        console.log('Ну да я же дома');
      }
    } catch (error) {
      alert('Ошибка получения геолокации');
    }
  };

    return (
      <div>
      <div className="controls-container">
        <button 
          className="map-button"
          onClick={handleNextPoint}
          disabled={currentIndex >= points.length}
        >
          {currentIndex >= points.length ? 'Готово!' : 'Проверить'}
        </button>
        
        <button
          className="map-button"
          onClick={() => setIsHistoryOpen(true)}
        >
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

      <GameMap currentPoint={points[currentIndex]} />
    </div>
    );
}
export default Game;
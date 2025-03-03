import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useState, useEffect, useRef, useCallback } from "react";
import marker from '../assets/marker.png';
import heromarker from '../assets/heromarker.png';
import 'leaflet/dist/leaflet.css';
import './GameMap.css';

const customPointIcon = new Icon({ iconUrl: marker, iconSize: [64, 64] });
const customHeroIcon = new Icon({ iconUrl: heromarker, iconSize: [64, 64] });

/** Компонент для плавного зума */
function SmoothZoom({ position, trigger, resetZoom }) {
  const map = useMap();

  useEffect(() => {
    if (trigger && position) {
      map.flyTo(position, 15, { duration: 2 });
      setTimeout(resetZoom, 2000);
    }
  }, [trigger, position, map, resetZoom]);

  return null;
}

/** Компонент возврата к пользователю */
function ReturnToUser({ userPosition, trigger, resetReturnTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (trigger && userPosition) {
      map.flyTo(userPosition, 15, { duration: 2 });
      setTimeout(resetReturnTrigger, 2000);
    }
  }, [trigger, userPosition, map, resetReturnTrigger]);

  return null;
}

/** Компонент для установки стартовой позиции */
function InitialPosition({ userPosition }) {
  const map = useMap();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (userPosition && !isInitialized.current) {
      map.flyTo(userPosition, 15, { duration: 1 });
      isInitialized.current = true;
    }
  }, [userPosition, map]);

  return null;
}

function GameMap({ currentPoint, animateMarker, resetAnimation, zoomTrigger, resetZoom }) {
  const [userPosition, setUserPosition] = useState(null);
  const [markerOpacity, setMarkerOpacity] = useState(0);
  const [returnTrigger, setReturnTrigger] = useState(false);
  const intervalRef = useRef(null); // Ref для контроля интервала
  const markerOpacityRef = useRef(0); // Храним предыдущее значение

  /** Получаем координаты пользователя */
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");

    if (savedLocation) {
      setUserPosition(JSON.parse(savedLocation)); // Загружаем сохраненные координаты
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPos = [position.coords.latitude, position.coords.longitude];
        setUserPosition(newPos);
        localStorage.setItem("userLocation", JSON.stringify({ lat: newPos[0], lon: newPos[1] }));
      },
      (error) => {
        console.error("Ошибка геолокации:", error);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Сбрасываем прозрачность при изменении текущей точки
  useEffect(() => {
    setMarkerOpacity(0);
    markerOpacityRef.current = 0;
  }, [currentPoint]);

  /** Анимация появления маркера */
  useEffect(() => {
    if (!animateMarker || !currentPoint) {
       // Гарантируем прозрачность, если анимация не активна
      setMarkerOpacity(0);
      markerOpacityRef.current = 0;
      return;
    }

    let timeoutId = null;
    let opacity = 0;
    setMarkerOpacity(0);

    intervalRef.current = setInterval(() => {
      opacity = Math.min(opacity + 0.05, 1);
      setMarkerOpacity(opacity);
      markerOpacityRef.current = opacity; // Сохраняем значение
      if (opacity === 1) {
        clearInterval(intervalRef.current);
        timeoutId = setTimeout(() => setReturnTrigger(prev => !prev), 1000)
        }
    }, 100);

    return () => {
      clearInterval(intervalRef.current);
      if (timeoutId) clearTimeout(timeoutId);
      resetAnimation();
    };
  }, [animateMarker, currentPoint, resetAnimation]);

  /** Обработчик возврата к пользователю */
  const handleReturnToUser = useCallback(() => setReturnTrigger(true), []);

  return (
      <MapContainer center={[53.1959, 50.1002]} zoom={15} className="map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.png'
        />

        <InitialPosition userPosition={userPosition} />
        <SmoothZoom position={currentPoint?.coordinates} trigger={zoomTrigger} resetZoom={resetZoom} />
        <ReturnToUser userPosition={userPosition} trigger={returnTrigger} resetReturnTrigger={() => setReturnTrigger(false)} />

        {currentPoint && (
          <Marker position={currentPoint.coordinates} icon={customPointIcon} opacity={markerOpacity}>
            <Popup>{currentPoint.text}</Popup>
          </Marker>
        )}

        {userPosition && (
          <Marker position={userPosition} icon={customHeroIcon}>
            <Popup>Вы здесь</Popup>
          </Marker>
        )}
        <div className="map-button-container">
          <button className="return-button" onClick={handleReturnToUser}>
            📍
          </button>
      </div>
      </MapContainer>
  );
}

export default GameMap;

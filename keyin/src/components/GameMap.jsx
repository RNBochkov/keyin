import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import { useState, useEffect, useRef, useCallback } from "react";
import marker from "../assets/marker.png";
import heromarker from "../assets/heromarker.png";
import "leaflet/dist/leaflet.css";
import "./GameMap.css";

const customPointIcon = new Icon({ iconUrl: marker, iconSize: [64, 64] });
const customHeroIcon = new Icon({ iconUrl: heromarker, iconSize: [64, 64] });

/**
 * Универсальный компонент для управления анимациями карты
 * @param {Object} params - Параметры анимации
 * @param {string} params.type - Тип анимации: 'zoom' | 'return' | 'initial'
 * @param {Array} params.position - Координаты [lat, lng]
 * @param {boolean} params.trigger - Флаг активации анимации
 * @param {Function} params.onComplete - Колбэк по завершении анимации
 * @param {number} params.zoomLevel - Уровень приближения
 * @param {number} params.duration - Длительность анимации (сек)
 */
function MapAnimation({
  type = "zoom",
  position,
  trigger,
  onComplete,
  zoomLevel = 16,
  duration = 1,
}) {
  const map = useMap();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!position || !map) return;

    // Обработка начальной позиции (однократное выполнение)
    if (type === "initial") {
      if (!isInitialized.current) {
        map.flyTo(position, zoomLevel, { duration });
        isInitialized.current = true;
      }
      return;
    }

    // Обработка триггерных анимаций
    if (trigger) {
      const animationParams = {
        zoom: { center: position, zoom: zoomLevel },
        return: { center: position, zoom: zoomLevel },
      }[type];

      if (animationParams) {
        map.flyTo(animationParams.center, animationParams.zoom, {
          duration: duration,
        });

        // Вызов колбэка после анимации
        if (onComplete) {
          const timeout = duration * 1000;
          const timerId = setTimeout(() => onComplete(), timeout);
          return () => clearTimeout(timerId);
        }
      }
    }
  }, [trigger, position, map, type, onComplete, zoomLevel, duration]);

  return null;
}

function GameMap({
  currentPoint,
  animateMarker,
  resetAnimation,
  zoomTrigger,
  resetZoom,
}) {
  const [userPosition, setUserPosition] = useState(null);
  const [markerOpacity, setMarkerOpacity] = useState(0);
  const [returnTrigger, setReturnTrigger] = useState(false);
  const intervalRef = useRef(null);
  const markerOpacityRef = useRef(0);

  // Получение и отслеживание позиции пользователя
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) setUserPosition(JSON.parse(savedLocation));

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPos = [position.coords.latitude, position.coords.longitude];
        setUserPosition(newPos);
        localStorage.setItem(
          "userLocation",
          JSON.stringify({ lat: newPos[0], lon: newPos[1] })
        );
      },
      (error) => console.error("Ошибка геолокации:", error),
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Сброс прозрачности при смене точки
  useEffect(() => {
    setMarkerOpacity(0);
    markerOpacityRef.current = 0;
  }, [currentPoint]);

  // Анимация появления маркера
  useEffect(() => {
    if (!animateMarker || !currentPoint) {
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
      markerOpacityRef.current = opacity;

      if (opacity >= 1) {
        clearInterval(intervalRef.current);
        timeoutId = setTimeout(() => setReturnTrigger((prev) => !prev), 1000);
      }
    }, 100);

    return () => {
      clearInterval(intervalRef.current);
      if (timeoutId) clearTimeout(timeoutId);
      resetAnimation();
    };
  }, [animateMarker, currentPoint, resetAnimation]);

  // Обработчик возврата к пользователю
  const handleReturnToUser = useCallback(() => setReturnTrigger(true), []);

  return (
    <MapContainer
      center={[53.1959, 50.1002]}
      zoom={15}
      className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.png"
      />

      {/* Начальная позиция */}
      <MapAnimation
        type="initial"
        position={userPosition}
        zoomLevel={15}
        duration={1}
      />

      {/* Зум к текущей точке */}
      <MapAnimation
        type="zoom"
        position={currentPoint?.coordinates}
        trigger={zoomTrigger}
        onComplete={resetZoom}
        duration={2}
      />

      {/* Возврат к пользователю */}
      <MapAnimation
        type="return"
        position={userPosition}
        trigger={returnTrigger}
        onComplete={() => setReturnTrigger(false)}
        duration={2}
      />

      {currentPoint && (
        <Marker
          position={currentPoint.coordinates}
          icon={customPointIcon}
          opacity={markerOpacity}
        >
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

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useMap } from 'react-leaflet/hooks'
import { useState, useEffect, useRef  } from "react";
// import L from 'leaflet';
import marker from '../assets/marker.png'
import heromarker from '../assets/heromarker.png'
import 'leaflet/dist/leaflet.css';
import './GameMap.css'

// Фикс для иконок маркеров
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

const customPointIcon = new Icon({
  iconUrl: marker,
  iconSize: [64,64]
});

const customHeroIcon = new Icon({
  iconUrl: heromarker,
  iconSize: [64,64]
});

// // Компонент для следования карты за пользователем
// function MoveMap({ position }) {
//   const map = useMap();
//   useEffect(() => {
//     if (position) {
//       map.setView(position, map.getZoom());
//     }
//   }, [position, map]);
//   return null;
// }

// Анимированный маркер с поддержкой прозрачности
const AnimatedMarker = ({ position, icon, opacity, children }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (markerRef.current && opacity !== undefined) {
      markerRef.current.setOpacity(opacity);
    }
  }, [opacity]);

  return (
    <Marker
      position={position}
      icon={icon}
      ref={markerRef}
    >
      {children}
    </Marker>
  );
};

// Компонент для плавного перемещения карты и зума
function SmoothZoom({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 2 }); // Плавный зум за 2 секунды
    }
  }, [position, map]);

  return null;
}

function GameMap({ currentPoint }) {
    const [userPosition, setUserPosition] = useState(null);
    const [markerOpacity, setMarkerOpacity] = useState(0); // Начальная прозрачность 0

    useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error("Ошибка геолокации:", error);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (currentPoint) {
      let isMounted = true;
      let opacity = 0;
      setMarkerOpacity(opacity);

      const interval = setInterval(() => {
        if (!isMounted) return;
        opacity += 0.05;
        if (opacity >= 1) {
          opacity = 1;
          clearInterval(interval);
        }
        setMarkerOpacity(opacity);
      }, 100);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    } else {
      setMarkerOpacity(0);
    }
  }, [currentPoint]);

    return (
    <MapContainer
      center={userPosition || [53.1959, 50.1002]}
      zoom={13}
      className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        url='https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.png'
      />

      {/* <MoveMap position={userPosition} /> */}
      <SmoothZoom position={currentPoint?.coordinates} />

      {currentPoint && (
        <AnimatedMarker
          position={currentPoint.coordinates}
          icon={customPointIcon}
          opacity={markerOpacity}
        >
          <Popup>{currentPoint.text}</Popup>
        </AnimatedMarker>
      )}

      {userPosition && (
        <Marker position={userPosition} icon={customHeroIcon}>
          <Popup>Вы здесь</Popup>
        </Marker>
      )}
    </MapContainer>
    );
}

export default GameMap;
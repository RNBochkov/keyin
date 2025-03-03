import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useMap } from 'react-leaflet/hooks';
import { useState, useEffect, useRef } from "react";
import marker from '../assets/marker.png';
import heromarker from '../assets/heromarker.png';
import 'leaflet/dist/leaflet.css';
import './GameMap.css';

const customPointIcon = new Icon({
  iconUrl: marker,
  iconSize: [64, 64]
});

const customHeroIcon = new Icon({
  iconUrl: heromarker,
  iconSize: [64, 64]
});

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

function SmoothZoom({ position, trigger, resetZoom }) {
  const map = useMap();

  useEffect(() => {
    if (trigger && position) {
      map.flyTo(position, 15, { duration: 2 });

      setTimeout(() => {
        resetZoom(); // Сбрасываем trigger после анимации зума
      }, 2000);
    }
  }, [trigger, position, map, resetZoom]);
  
  return null;
}

function ReturnToUser({ userPosition, trigger, resetReturnTrigger }) {
  const map = useMap();

  useEffect(() => {
    if (trigger && userPosition) {
      map.flyTo(userPosition, 15, { duration: 2 });

      setTimeout(() => {
        resetReturnTrigger(); // Сбрасываем триггер после завершения анимации
      }, 2000);
    }
  }, [trigger, userPosition, map, resetReturnTrigger]);

  return null;
}

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

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPos = [
          position.coords.latitude,
          position.coords.longitude
        ];
        setUserPosition(newPos);
      },
      (error) => {
        console.error("Ошибка геолокации:", error);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (animateMarker && currentPoint) {
      let isMounted = true;
      let opacity = 0;
      let timeoutId = null;
      setMarkerOpacity(opacity);

      const interval = setInterval(() => {
        if (!isMounted) return;
        opacity += 0.05;
        if (opacity >= 1) {
          opacity = 1;
          clearInterval(interval);
          setMarkerOpacity(1);
          timeoutId = setTimeout(() => {
            setReturnTrigger(prev => !prev);
          }, 1000);
        }
        setMarkerOpacity(opacity);
        
      }, 100);

      return () => {
        isMounted = false;
        clearInterval(interval);
        if (timeoutId) clearTimeout(timeoutId);
        resetAnimation(); // Сбрасываем animateMarker в false
      };
    } else {
      setMarkerOpacity(0);
      
    }
  }, [animateMarker, currentPoint, resetAnimation]);

  return (
      <MapContainer
        center={[53.1959, 50.1002]} // Дефолтные координаты
        zoom={15}
        className="map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.png'
        />
        
        <InitialPosition userPosition={userPosition} />
        <SmoothZoom position={currentPoint?.coordinates} trigger={zoomTrigger} resetZoom={resetZoom}/>
        <ReturnToUser userPosition={userPosition} trigger={returnTrigger} resetReturnTrigger={() => setReturnTrigger(false)} />

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

        <div className="map-button-container">
  <button className="return-button" onClick={() => setReturnTrigger(true)}>
    📍
  </button>
</div>

      </MapContainer>
  );
}

export default GameMap;
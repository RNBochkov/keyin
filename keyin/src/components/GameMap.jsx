import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './GameMap.css'

// Фикс для иконок маркеров
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function GameMap({ currentPoint }) {
    return (
    <MapContainer
      center={currentPoint?.coordinates || [53.1959, 50.1002]}
      zoom={13}
      className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.png"
      />

      {currentPoint && (
        <Marker position={currentPoint.coordinates}>
          <Popup>{currentPoint.text}</Popup>
        </Marker>
      )}
    </MapContainer>
    );
}

export default GameMap;
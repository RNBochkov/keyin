import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
// import L from 'leaflet';
import marker from '../assets/marker.png'
import 'leaflet/dist/leaflet.css';
import './GameMap.css'

// Фикс для иконок маркеров
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
//   iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
//   shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
// });

const customIcon = new Icon({
  iconUrl: marker,
  iconSize: [50,50]
});

function GameMap({ currentPoint }) {
    return (
    <MapContainer
      center={currentPoint?.coordinates || [53.1959, 50.1002]}
      zoom={14}
      className="map-container"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        url='https://tiles.stadiamaps.com/tiles/stamen_watercolor/{z}/{x}/{y}.png'
      />

      {currentPoint && (
        <Marker position={currentPoint.coordinates} icon={customIcon}>
          <Popup>{currentPoint.text}</Popup>
        </Marker>
      )}
    </MapContainer>
    );
}

export default GameMap;
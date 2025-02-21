import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const points = [
  { id: 1, name: 'Сюда нам надо', coords: [ 53.1860722, 50.0927639] },
  { id: 2, name: 'Точка 2', coords: [53.210, 50.120] },
];

const customIcon = new Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/32/684/684908.png', 
  iconSize: [32, 32],
});

function GameMap() {
    return (
      <MapContainer center={[53.1959, 50.1002]} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {points.map((point) => (
        <Marker key={point.id} position={point.coords} icon={customIcon}>
          <Popup>{point.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
    );
}

export default GameMap;
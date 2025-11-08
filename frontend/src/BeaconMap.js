import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const beaconIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNGRjAwMDAiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPC9zdmc+Cjwvc3ZnPgo=',
  iconSize: [25, 25],
  iconAnchor: [12, 12]
});

const alertIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiIGZpbGw9IiNGRkE1MDAiLz4KPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPC9zdmc+Cjwvc3ZnPgo=',
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function BeaconMap({ beacons, incidents }) {
  const [mapCenter, setMapCenter] = useState([11.0, 76.5]); // South India center
  const [mapZoom, setMapZoom] = useState(8); // Regional zoom level

  const quickZoomButtons = [
    { name: 'All Areas', center: [11.0, 76.5], zoom: 7 },
    { name: 'Western Ghats', center: [10.5, 76.8], zoom: 9 },
    { name: 'Nilgiris', center: [11.4, 76.7], zoom: 10 },
    { name: 'Coorg Region', center: [12.3, 75.8], zoom: 10 }
  ];

  return (
    <div>
      {/* Quick Zoom Controls */}
      <div style={{ marginBottom: '10px', display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {quickZoomButtons.map(button => (
          <button 
            key={button.name}
            onClick={() => {
              setMapCenter(button.center);
              setMapZoom(button.zoom);
            }}
            style={{
              padding: '5px 10px',
              fontSize: '12px',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {button.name}
          </button>
        ))}
      </div>
      
      <MapContainer 
        center={mapCenter} 
        zoom={mapZoom} 
        style={{ height: '500px', width: '100%' }}
        key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        
        {/* Beacon markers */}
        {beacons.map(beacon => (
          <Marker key={beacon.id} position={[beacon.lat, beacon.lng]} icon={beaconIcon}>
            <Popup>
              <div>
                <h3>🚨 {beacon.name}</h3>
                <p><strong>Beacon ID:</strong> {beacon.id}</p>
                <p><strong>Danger Type:</strong> <span style={{color: 'red', fontWeight: 'bold'}}>{beacon.danger}</span></p>
                <p><strong>Status:</strong> <span style={{color: beacon.status === 'active' ? 'green' : 'red'}}>{beacon.status}</span></p>
                <p><strong>Location:</strong> {beacon.lat.toFixed(4)}, {beacon.lng.toFixed(4)}</p>
                <p><strong>Warning:</strong> 120dB siren + voice alert</p>
              </div>
            </Popup>
            <Circle
              center={[beacon.lat, beacon.lng]}
              radius={200}
              pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1 }}
            />
          </Marker>
        ))}
        
        {/* Incident markers */}
        {incidents.map(incident => (
          <Marker 
            key={incident._id} 
            position={[incident.latitude, incident.longitude]} 
            icon={alertIcon}
          >
            <Popup>
              <div>
                <h3>🚨 Tourist Warning Triggered</h3>
                <p><strong>Beacon:</strong> {incident.beaconId}</p>
                <p><strong>Time:</strong> {new Date(incident.timestamp).toLocaleString()}</p>
                <p><strong>Blockchain:</strong> {incident.blockchainTxHash}</p>
                <p><strong>Status:</strong> {incident.resolved ? '✅ Resolved' : '⚠️ Active'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend */}
      <div style={{ 
        marginTop: '10px', 
        padding: '10px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <strong>🗺️ South India Tourist Safety Network:</strong>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '5px' }}>
          <span>🔴 Danger Zones</span>
          <span>🟡 Recent Alerts</span>
          <span>📍 {beacons.length} Active Beacons</span>
          <span>🏔️ Hill Stations Protected</span>
        </div>
      </div>
    </div>
  );
}

export default BeaconMap;
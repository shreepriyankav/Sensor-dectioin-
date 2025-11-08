import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BeaconMap from './BeaconMap';
import IncidentList from './IncidentList';
import './App.css';

function App() {
  const [incidents, setIncidents] = useState([]);
  const [beacons, setBeacons] = useState([
    { id: 'BEACON_01', name: 'Valparai Cliff Edge', lat: 10.3270, lng: 76.9550, status: 'active', danger: 'Fatal Falls' },
    { id: 'BEACON_02', name: 'Munnar Tea Garden Falls', lat: 10.0889, lng: 77.0595, status: 'active', danger: 'Drowning Risk' },
    { id: 'BEACON_03', name: 'Kodaikanal Lake Deep End', lat: 10.2381, lng: 77.4892, status: 'active', danger: 'Drowning' },
    { id: 'BEACON_04', name: 'Ooty Botanical Restricted', lat: 11.4064, lng: 76.6932, status: 'active', danger: 'Poisonous Plants' },
    { id: 'BEACON_05', name: 'Coorg Waterfall Edge', lat: 12.3375, lng: 75.8069, status: 'active', danger: 'Fatal Falls' },
    { id: 'BEACON_06', name: 'Wayanad Wildlife Zone', lat: 11.6854, lng: 76.1320, status: 'active', danger: 'Animal Attack' }
  ]);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/incidents');
      setIncidents(response.data);
    } catch (error) {
      console.log('Backend not available - using demo data');
      // Demo data for development
      setIncidents([
        {
          _id: '1',
          beaconId: 'BEACON_01',
          timestamp: new Date(),
          latitude: 10.3270,
          longitude: 76.9550,
          blockchainTxHash: '0xabc123...',
          resolved: false
        }
      ]);
    }
  };

  return (
    <div className="App">
      <header className="header">
        <h1>🚨 Tourist Safety Beacon System</h1>
        <div className="stats">
          <div className="stat">
            <span className="number">{beacons.length}</span>
            <span className="label">Active Beacons</span>
          </div>
          <div className="stat">
            <span className="number">{incidents.length}</span>
            <span className="label">Total Alerts</span>
          </div>
          <div className="stat">
            <span className="number">{incidents.filter(i => !i.resolved).length}</span>
            <span className="label">Unresolved</span>
          </div>
        </div>
      </header>

      <div className="dashboard">
        <div className="map-section">
          <h2>Beacon Locations & Alerts</h2>
          <BeaconMap beacons={beacons} incidents={incidents} />
        </div>
        
        <div className="incidents-section">
          <h2>Recent Tourist Warnings</h2>
          <IncidentList incidents={incidents} onIncidentUpdate={fetchIncidents} />
        </div>
      </div>
    </div>
  );
}

export default App;
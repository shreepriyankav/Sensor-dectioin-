import React, { useState } from 'react';
import axios from 'axios';

function IncidentList({ incidents, onIncidentUpdate }) {
  const [selectedIncident, setSelectedIncident] = useState(null);

  const handleResolve = async (incidentId) => {
    try {
      await axios.put(`http://localhost:3000/api/incidents/${incidentId}/resolve`);
      alert('✅ Incident marked as resolved!');
      if (onIncidentUpdate) onIncidentUpdate();
    } catch (error) {
      alert('❌ Failed to resolve incident');
    }
  };

  const handleViewDetails = (incident) => {
    setSelectedIncident(incident);
    alert(`📋 INCIDENT DETAILS:\n\n` +
      `Beacon: ${incident.beaconId}\n` +
      `Time: ${new Date(incident.timestamp).toLocaleString()}\n` +
      `Location: ${incident.latitude}, ${incident.longitude}\n` +
      `Blockchain: ${incident.blockchainTxHash}\n` +
      `Status: ${incident.resolved ? 'Resolved' : 'Active'}\n` +
      `Action: Tourist warned with 120dB siren`);
  };

  if (incidents.length === 0) {
    return (
      <div className="no-incidents">
        <p>✅ No tourist warnings today - All areas safe!</p>
      </div>
    );
  }

  return (
    <div className="incident-list">
      {incidents.map(incident => (
        <div key={incident._id} className={`incident-card ${incident.resolved ? 'resolved' : 'active'}`}>
          <div className="incident-header">
            <span className="beacon-id">{incident.beaconId}</span>
            <span className="timestamp">{new Date(incident.timestamp).toLocaleString()}</span>
          </div>
          
          <div className="incident-details">
            <p>📍 Location: {incident.latitude}, {incident.longitude}</p>
            <p>🔗 Blockchain: {incident.blockchainTxHash}</p>
            <p>Status: {incident.resolved ? '✅ Resolved' : '🚨 Tourist Warned'}</p>
          </div>
          
          <div className="incident-actions">
            {!incident.resolved && (
              <button 
                className="resolve-btn"
                onClick={() => handleResolve(incident._id)}
              >
                Mark as Resolved
              </button>
            )}
            <button 
              className="view-btn"
              onClick={() => handleViewDetails(incident)}
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default IncidentList;
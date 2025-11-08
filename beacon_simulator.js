const axios = require('axios');

class BeaconSimulator {
  constructor() {
    this.beacons = [
      { id: 'BEACON_01', name: 'Valparai Cliff Edge', lat: 10.3270, lng: 76.9550 },
      { id: 'BEACON_02', name: 'Munnar Tea Garden Falls', lat: 10.0889, lng: 77.0595 },
      { id: 'BEACON_03', name: 'Kodaikanal Lake Deep End', lat: 10.2381, lng: 77.4892 },
      { id: 'BEACON_04', name: 'Ooty Botanical Restricted', lat: 11.4064, lng: 76.6932 },
      { id: 'BEACON_05', name: 'Coorg Waterfall Edge', lat: 12.3375, lng: 75.8069 },
      { id: 'BEACON_06', name: 'Wayanad Wildlife Zone', lat: 11.6854, lng: 76.1320 }
    ];
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
    console.log('🚨 Tourist Safety Beacon Simulator Started');
    console.log('Simulating tourist approaching dangerous areas...\n');
    
    // Simulate random tourist warnings
    setInterval(() => {
      if (this.isRunning) {
        this.simulateTouristWarning();
      }
    }, 60000); // Every 60 seconds (1 minute)
  }

  simulateTouristWarning() {
    const beacon = this.beacons[Math.floor(Math.random() * this.beacons.length)];
    const alertData = {
      beaconId: beacon.id,
      timestamp: Date.now(),
      latitude: beacon.lat,
      longitude: beacon.lng,
      alertCount: Math.floor(Math.random() * 5) + 1
    };

    console.log(`🚨 SIMULATED ALERT: Tourist approaching ${beacon.name}`);
    console.log(`   Beacon: ${beacon.id}`);
    console.log(`   Location: ${beacon.lat}, ${beacon.lng}`);
    console.log(`   Time: ${new Date().toLocaleString()}`);
    console.log('   Action: SIREN ACTIVATED → Tourist warned!\n');

    // Send to backend
    this.sendAlert(alertData);
  }

  async sendAlert(alertData) {
    try {
      await axios.post('http://localhost:3000/api/alert', alertData);
      console.log('✅ Alert sent to backend successfully\n');
    } catch (error) {
      console.log('❌ Backend not running - alert logged locally only\n');
    }
  }

  stop() {
    this.isRunning = false;
    console.log('Beacon simulator stopped');
  }
}

// Start simulator
const simulator = new BeaconSimulator();
simulator.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
  simulator.stop();
  process.exit(0);
});
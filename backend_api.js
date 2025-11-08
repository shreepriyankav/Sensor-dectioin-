const express = require('express');
const twilio = require('twilio');
const mqtt = require('mqtt');
const mongoose = require('mongoose');
const BlockchainService = require('./blockchain_service');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});

// Services
let twilioClient = null;
try {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid';
  const authToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
  if (accountSid.startsWith('AC') && authToken !== 'your_auth_token') {
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio SMS service enabled');
  } else {
    console.log('Twilio not configured - SMS alerts disabled');
  }
} catch (error) {
  console.log('Twilio initialization failed - SMS alerts disabled');
}

const blockchain = new BlockchainService();
// MQTT connection (optional)
let mqttClient;
try {
  mqttClient = mqtt.connect('mqtt://localhost:1883');
  console.log('MQTT broker connection attempted');
} catch (error) {
  console.log('MQTT broker not available - direct HTTP only');
}

// In-memory storage fallback
let memoryIncidents = [];
let mongoConnected = false;
let Incident;

// MongoDB connection (optional)
try {
  mongoose.connect('mongodb://localhost:27017/wildlife_protection');
  mongoose.connection.on('connected', () => {
    mongoConnected = true;
    console.log('MongoDB connected successfully');
  });
  mongoose.connection.on('error', () => {
    mongoConnected = false;
    console.log('MongoDB connection failed - using memory storage');
  });
  
  // Incident schema
  const incidentSchema = new mongoose.Schema({
    beaconId: String,
    timestamp: Date,
    latitude: Number,
    longitude: Number,
    blockchainTxHash: String,
    resolved: { type: Boolean, default: false }
  });
  Incident = mongoose.model('Incident', incidentSchema);
} catch (error) {
  mongoConnected = false;
  console.log('MongoDB not available - using memory storage');
}

// MQTT message handler
if (mqttClient) {
  mqttClient.on('message', async (topic, message) => {
    if (topic === 'wildlife/alert') {
      const alertData = JSON.parse(message.toString());
      await processAlert(alertData);
    }
  });
  
  mqttClient.subscribe('wildlife/alert');
}

// Process alert function
async function processAlert(alertData) {
  const { beaconId, timestamp, latitude, longitude } = alertData;
  
  try {
    let incident;
    
    if (mongoConnected && Incident) {
      // Save to MongoDB
      incident = new Incident({ beaconId, timestamp: new Date(timestamp), latitude, longitude });
      await incident.save();
    } else {
      // Save to memory
      incident = {
        _id: Date.now().toString(),
        beaconId,
        timestamp: new Date(timestamp),
        latitude,
        longitude,
        resolved: false
      };
      memoryIncidents.push(incident);
    }
    
    // Record on blockchain
    const txHash = await blockchain.recordIncident(beaconId, latitude * 1000000, longitude * 1000000);
    incident.blockchainTxHash = txHash;
    
    if (mongoConnected && Incident) {
      await incident.save();
    }
    
    // Send SMS alert if Twilio is configured
    if (twilioClient) {
      try {
        await twilioClient.messages.create({
          body: `🚨 TOURIST SAFETY ALERT: Motion detected at beacon ${beaconId}. Location: ${latitude}, ${longitude}. Blockchain: ${txHash}`,
          from: process.env.TWILIO_PHONE || '+your_twilio_number',
          to: process.env.ADMIN_PHONE || '+1234567890'
        });
        console.log('SMS alert sent');
      } catch (smsError) {
        console.log('SMS failed:', smsError.message);
      }
    } else {
      console.log('SMS alert skipped - Twilio not configured');
    }
    
    console.log(`Alert processed: ${beaconId} - Blockchain: ${txHash}`);
  } catch (error) {
    console.error('Error processing alert:', error);
  }
}

// REST API endpoints
app.post('/api/alert', async (req, res) => {
  try {
    await processAlert(req.body);
    res.json({ success: true, message: 'Alert processed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process alert' });
  }
});

app.get('/api/incidents', async (req, res) => {
  try {
    if (mongoConnected && Incident) {
      const incidents = await Incident.find().sort({ timestamp: -1 });
      res.json(incidents);
    } else {
      // Return memory incidents sorted by timestamp
      const sortedIncidents = memoryIncidents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      res.json(sortedIncidents);
    }
  } catch (error) {
    res.json(memoryIncidents);
  }
});

app.put('/api/incidents/:id/resolve', async (req, res) => {
  try {
    if (mongoConnected && Incident) {
      const incident = await Incident.findByIdAndUpdate(
        req.params.id,
        { resolved: true, resolvedAt: new Date() },
        { new: true }
      );
      res.json({ success: true, incident });
    } else {
      // Update memory incident
      const incident = memoryIncidents.find(inc => inc._id === req.params.id);
      if (incident) {
        incident.resolved = true;
        incident.resolvedAt = new Date();
        res.json({ success: true, incident });
      } else {
        res.status(404).json({ error: 'Incident not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve incident' });
  }
});

app.get('/api/incidents/:id', async (req, res) => {
  try {
    if (mongoConnected && Incident) {
      const incident = await Incident.findById(req.params.id);
      res.json(incident);
    } else {
      const incident = memoryIncidents.find(inc => inc._id === req.params.id);
      if (incident) {
        res.json(incident);
      } else {
        res.status(404).json({ error: 'Incident not found' });
      }
    }
  } catch (error) {
    res.status(404).json({ error: 'Incident not found' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'active', timestamp: Date.now() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Wildlife Protection API running on port ${PORT}`);
});
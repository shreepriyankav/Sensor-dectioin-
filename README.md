# Wildlife Protection Beacon System

## 🎯 Network-Independent Solution

### Primary Function: OFFLINE WARNING (No Network Needed)
- Motion sensor detects tourist
- 120dB siren plays immediately
- Red LED flashes
- Tourist scared away ✅

### Secondary Function: ADMIN ALERT (LoRa Mesh)
- Alert sent via LoRa (10-15km range)
- No internet needed at beacon location
- Mesh network relays to gateway
- Gateway forwards to backend → SMS

## Hardware Requirements

### Beacon Components ($68 each)
- Arduino Nano: $15
- PIR Motion Sensor: $8
- 120dB Siren: $15
- LoRa Module (433MHz): $8
- SD Card Module: $5
- Solar Panel (20W): $20
- Battery (12V 7Ah): $15
- Weatherproof Case: $12

### Gateway Components ($100)
- ESP32: $25
- LoRa Module: $8
- WiFi Connection: Included
- Power Supply: $15
- Case: $10

## Setup Instructions

### 1. Flash Beacon Code
```bash
# Upload wildlife_beacon.ino to Arduino Nano
# Connect components as per pin definitions
```

### 2. Flash Gateway Code
```bash
# Upload lora_gateway.ino to ESP32
# Configure WiFi credentials
```

### 3. Deploy Backend
```bash
npm install
npm start
```

### 4. Configure Twilio
- Get Twilio account
- Update credentials in backend_api.js
- Set admin phone number

## System Architecture

```
Tourist Approaches
    ↓
Motion Sensor (PIR)
    ↓
IMMEDIATE: Siren + LED (OFFLINE) ✅
    ↓
Log to SD Card (OFFLINE) ✅
    ↓
Send LoRa Alert (NO INTERNET NEEDED)
    ↓
LoRa Mesh Network (10-15km hops)
    ↓
Gateway (Forest Office)
    ↓
Backend API
    ↓
SMS to Admin
```

## Power Consumption
- Standby: 0.1W (24/7)
- Alert: 10W (2 minutes)
- Daily: ~3Wh
- Solar generates: 80Wh/day
- Battery backup: 30 days without sun

## Coverage Example
- Entry Point: Beacon 1
- 10km: Relay Beacon 2  
- 20km: Relay Beacon 3
- 30km: Gateway (Forest Office)
- Total: 30km deep forest coverage

## Key Features
✅ Works 100% offline for primary function
✅ No network required at beacon location
✅ Solar powered (unlimited operation)
✅ Mesh network extends range
✅ Local data logging
✅ Zero maintenance
✅ Immediate tourist warning
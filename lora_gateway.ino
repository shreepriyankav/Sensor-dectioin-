#include <LoRa.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "your_wifi";
const char* password = "your_password";

// MQTT broker
const char* mqttServer = "your-backend-server.com";
const int mqttPort = 1883;
const char* mqttTopic = "wildlife/alert";

WiFiClient wifiClient;
PubSubClient mqttClient(wifiClient);

void setup() {
  Serial.begin(9600);
  
  // Initialize LoRa
  LoRa.setPins(10, 7, 6);
  if (LoRa.begin(433E6)) {
    Serial.println("LoRa Gateway initialized");
  }
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("WiFi connected");
  
  // Connect to MQTT
  mqttClient.setServer(mqttServer, mqttPort);
  connectMQTT();
}

void loop() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();
  
  // Listen for LoRa packets
  int packetSize = LoRa.parsePacket();
  if (packetSize) {
    String message = "";
    while (LoRa.available()) {
      message += (char)LoRa.read();
    }
    
    Serial.println("Received: " + message);
    parseAndForward(message);
  }
  
  delay(100);
}

void connectMQTT() {
  while (!mqttClient.connected()) {
    if (mqttClient.connect("LoRaGateway")) {
      Serial.println("MQTT connected");
    } else {
      delay(5000);
    }
  }
}

void parseAndForward(String loraMessage) {
  // Parse: "ALERT:timestamp:count"
  int firstColon = loraMessage.indexOf(':');
  int secondColon = loraMessage.indexOf(':', firstColon + 1);
  
  if (firstColon > 0 && secondColon > 0) {
    String timestamp = loraMessage.substring(firstColon + 1, secondColon);
    String count = loraMessage.substring(secondColon + 1);
    
    // Create JSON payload
    StaticJsonDocument<200> doc;
    doc["beaconId"] = "BEACON_01";
    doc["timestamp"] = timestamp.toInt();
    doc["latitude"] = 10.3270;
    doc["longitude"] = 76.9550;
    doc["alertCount"] = count.toInt();
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Publish to MQTT
    mqttClient.publish(mqttTopic, jsonString.c_str());
    Serial.println("Alert forwarded via MQTT");
  }
}
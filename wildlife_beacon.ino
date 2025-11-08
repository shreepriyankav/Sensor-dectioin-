#include <LoRa.h>
#include <SD.h>

// Pin definitions
#define PIR_PIN 2
#define SIREN_PIN 3
#define LED_PIN 4
#define LORA_CS 10
#define SD_CS 9

// System state
bool motionDetected = false;
unsigned long lastAlert = 0;
int alertCount = 0;

void setup() {
  Serial.begin(9600);
  
  // Initialize pins
  pinMode(PIR_PIN, INPUT);
  pinMode(SIREN_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Initialize LoRa
  LoRa.setPins(LORA_CS, 7, 6);
  if (LoRa.begin(433E6)) {
    Serial.println("LoRa initialized");
  }
  
  // Initialize SD card
  if (SD.begin(SD_CS)) {
    Serial.println("SD card ready");
  }
  
  Serial.println("Wildlife Protection Beacon Active");
}

void loop() {
  // Check for motion
  if (digitalRead(PIR_PIN) == HIGH && !motionDetected) {
    triggerAlert();
    motionDetected = true;
    delay(5000); // 5 second alert duration
    stopAlert();
    motionDetected = false;
    delay(30000); // 30 second cooldown
  }
  
  delay(100);
}

void triggerAlert() {
  alertCount++;
  unsigned long timestamp = millis();
  
  // Immediate offline warning (PRIMARY FUNCTION)
  digitalWrite(SIREN_PIN, HIGH);
  digitalWrite(LED_PIN, HIGH);
  
  // Log incident locally
  logIncident(timestamp);
  
  // Send LoRa alert if available
  sendLoRaAlert(timestamp);
  
  Serial.println("ALERT: Motion detected!");
}

void stopAlert() {
  digitalWrite(SIREN_PIN, LOW);
  digitalWrite(LED_PIN, LOW);
}

void logIncident(unsigned long timestamp) {
  File logFile = SD.open("alerts.txt", FILE_WRITE);
  if (logFile) {
    logFile.print(timestamp);
    logFile.print(",");
    logFile.print(alertCount);
    logFile.println();
    logFile.close();
  }
}

void sendLoRaAlert(unsigned long timestamp) {
  LoRa.beginPacket();
  LoRa.print("ALERT:");
  LoRa.print(timestamp);
  LoRa.print(":");
  LoRa.print(alertCount);
  LoRa.endPacket();
}
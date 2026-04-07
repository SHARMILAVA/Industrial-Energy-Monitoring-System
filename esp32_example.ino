#if defined(ESP8266)
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#else
#include <WiFi.h>
#include <HTTPClient.h>
#endif

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

const char* apiUrl = "http://YOUR_SERVER_IP:5000/api/data";
const char* deviceId = "esp32-001";
const char* deviceKey = "YOUR_THINGSPEAK_WRITE_KEY";

// Safety thresholds
const float TEMP_WARNING = 40.0;
const float TEMP_CRITICAL = 60.0;

// Relay control pin (set according to your board wiring)
const int RELAY_PIN = 5;

bool relayOn = true;
bool manualOverride = false;

float readTemperatureC() {
  // Replace this with your real sensor read logic (DHT/DS18B20/etc.)
  float mockTemp = 35.0 + (millis() % 30000) / 1000.0;
  return mockTemp;
}

void setRelay(bool on) {
  relayOn = on;
  digitalWrite(RELAY_PIN, on ? HIGH : LOW);
}

void applySafetyControl(float temperature) {
  if (manualOverride) return;

  if (temperature > TEMP_CRITICAL) {
    // Automatic shutdown on critical overheat
    setRelay(false);
    Serial.printf("AUTO SHUTDOWN: Overheat detected (%.2fC)\n", temperature);
  } else if (!relayOn) {
    // Resume operation when temperature returns to safe zone
    setRelay(true);
  }

  if (temperature >= TEMP_WARNING && temperature <= TEMP_CRITICAL) {
    Serial.printf("WARNING: High temperature (%.2fC)\n", temperature);
  }
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  setRelay(true);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(apiUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("x-device-key", deviceKey);

    float voltage = 230.5;
    float current = relayOn ? 4.9 : 0.0;
    float power = voltage * current;
    float energy = 15.7;
    float temperature = readTemperatureC();

    applySafetyControl(temperature);

    String payload = String("{") +
      "\"deviceId\":\"" + deviceId + "\"," +
      "\"voltage\":" + String(voltage, 2) + "," +
      "\"current\":" + String(current, 2) + "," +
      "\"power\":" + String(power, 2) + "," +
      "\"energy\":" + String(energy, 2) + "," +
      "\"temperature\":" + String(temperature, 2) + "," +
      "\"timestamp\":\"2026-02-12T08:30:00Z\"" +
      "}";

    int httpCode = http.POST(payload);
    Serial.printf("HTTP Response code: %d | Temp: %.2fC | Relay: %s\n", httpCode, temperature, relayOn ? "ON" : "OFF");
    http.end();
  }

  delay(5000);
}

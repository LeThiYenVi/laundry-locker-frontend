/**
 * Locker Controller Implementation
 * 
 * Điều khiển khóa solenoid qua relay và giao tiếp với backend
 */

#include "locker_controller.h"
#include "config.h"
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>

// ============================================
// State Variables
// ============================================
static bool _isUnlocked = false;
static unsigned long _unlockStartTime = 0;

// ============================================
// Helper Functions
// ============================================

/**
 * Điều khiển relay theo logic (active LOW/HIGH)
 */
void setRelay(bool on) {
    if (RELAY_ACTIVE_LOW) {
        digitalWrite(RELAY_PIN, on ? LOW : HIGH);
    } else {
        digitalWrite(RELAY_PIN, on ? HIGH : LOW);
    }
}

// ============================================
// Public Functions
// ============================================

void initLockerController() {
    // Cấu hình GPIO
    pinMode(RELAY_PIN, OUTPUT);
    pinMode(LED_STATUS, OUTPUT);
    
    // Đảm bảo relay ở trạng thái OFF ban đầu (khóa đóng)
    setRelay(false);
    // ESP8266 built-in LED is active LOW
    digitalWrite(LED_STATUS, HIGH);
    
    _isUnlocked = false;
    Serial.println("[LOCKER] Controller initialized");
    Serial.printf("[LOCKER] Relay pin: GPIO%d\n", RELAY_PIN);
}

void unlockBox() {
    Serial.println("[LOCKER] Unlocking box...");
    
    // Kích hoạt relay để mở solenoid
    setRelay(true);
    // ESP8266 built-in LED is active LOW
    digitalWrite(LED_STATUS, LOW);
    
    _isUnlocked = true;
    _unlockStartTime = millis();
    
    Serial.printf("[LOCKER] Box unlocked! Will auto-lock after %d ms\n", UNLOCK_DURATION);
}

void lockBox() {
    Serial.println("[LOCKER] Locking box...");
    
    // Tắt relay để đóng solenoid
    setRelay(false);
    // ESP8266 built-in LED is active LOW
    digitalWrite(LED_STATUS, HIGH);
    
    _isUnlocked = false;
    
    Serial.println("[LOCKER] Box locked!");
}

bool isUnlocked() {
    // Tự động khóa sau UNLOCK_DURATION
    if (_isUnlocked && (millis() - _unlockStartTime >= UNLOCK_DURATION)) {
        lockBox();
        Serial.println("[LOCKER] Auto-locked after timeout");
    }
    return _isUnlocked;
}

const char* getStatusString(BoxStatus status) {
    switch (status) {
        case STATUS_AVAILABLE: return "AVAILABLE";
        case STATUS_OCCUPIED: return "OCCUPIED";
        case STATUS_LOCKED: return "LOCKED";
        case STATUS_ERROR: return "ERROR";
        default: return "UNKNOWN";
    }
}

bool reportBoxStatus(BoxStatus status, bool isDoorOpen) {
    // Kiểm tra kết nối WiFi
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[LOCKER] WiFi not connected, cannot report status");
        return false;
    }
    
    WiFiClient client;
    HTTPClient http;
    String url = String(BACKEND_URL) + "/api/iot/box-status";
    
    Serial.printf("[LOCKER] Reporting status to: %s\n", url.c_str());
    
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(HTTP_TIMEOUT);
    
    // Tạo JSON body
    StaticJsonDocument<512> doc;
    doc["boxId"] = BOX_ID;
    doc["status"] = getStatusString(status);
    doc["deviceId"] = DEVICE_ID;
    doc["isDoorOpen"] = isDoorOpen;
    
    String jsonBody;
    serializeJson(doc, jsonBody);
    
    Serial.printf("[LOCKER] Request body: %s\n", jsonBody.c_str());
    
    int httpCode = http.POST(jsonBody);
    bool success = false;
    
    if (httpCode > 0) {
        Serial.printf("[LOCKER] HTTP Response: %d\n", httpCode);
        if (httpCode == HTTP_CODE_OK) {
            String response = http.getString();
            Serial.printf("[LOCKER] Response: %s\n", response.c_str());
            success = true;
        }
    } else {
        Serial.printf("[LOCKER] HTTP Error: %s\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
    return success;
}

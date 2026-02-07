/**
 * ESP32 Laundry Locker IoT Controller
 * 
 * Main entry point - Điều khiển tủ giặt thông qua ESP32
 * 
 * Chức năng:
 * - Kết nối WiFi
 * - Chạy HTTP server để nhận lệnh từ backend
 * - Điều khiển relay mở/khóa solenoid
 * - Gửi trạng thái về backend định kỳ
 * 
 * Hardware (theo sơ đồ):
 * - GPIO22: Relay control signal
 * - 12V DC Adapter: Power for solenoid lock
 * - Relay module: Controls the solenoid
 */

#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include "config.h"
#include "locker_controller.h"

// ============================================
// Global Variables
// ============================================
WebServer server(SERVER_PORT);
unsigned long lastStatusReport = 0;
unsigned long lastWiFiCheck = 0;

// ============================================
// WiFi Functions
// ============================================

void connectWiFi() {
    Serial.println("\n[WIFI] Connecting to WiFi...");
    Serial.printf("[WIFI] SSID: %s\n", WIFI_SSID);
    
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\n[WIFI] Connected!");
        Serial.printf("[WIFI] IP Address: %s\n", WiFi.localIP().toString().c_str());
        Serial.printf("[WIFI] Signal strength: %d dBm\n", WiFi.RSSI());
    } else {
        Serial.println("\n[WIFI] Connection failed!");
    }
}

void checkWiFiConnection() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("[WIFI] Connection lost, reconnecting...");
        connectWiFi();
    }
}

// ============================================
// HTTP Server Handlers
// ============================================

/**
 * Handle root endpoint - Thông tin thiết bị
 */
void handleRoot() {
    StaticJsonDocument<256> doc;
    doc["device"] = DEVICE_ID;
    doc["boxId"] = BOX_ID;
    doc["status"] = isUnlocked() ? "UNLOCKED" : "LOCKED";
    doc["uptime"] = millis() / 1000;
    doc["rssi"] = WiFi.RSSI();
    
    String response;
    serializeJson(doc, response);
    
    server.send(200, "application/json", response);
}

/**
 * Handle unlock endpoint - Mở khóa box
 * POST /unlock
 * Body: {"boxId": 1, "action": "UNLOCK"}
 */
void handleUnlock() {
    Serial.println("[SERVER] Received unlock request");
    
    if (server.hasArg("plain")) {
        String body = server.arg("plain");
        Serial.printf("[SERVER] Body: %s\n", body.c_str());
        
        StaticJsonDocument<256> doc;
        DeserializationError error = deserializeJson(doc, body);
        
        if (error) {
            Serial.printf("[SERVER] JSON parse error: %s\n", error.c_str());
            server.send(400, "application/json", "{\"success\":false,\"error\":\"Invalid JSON\"}");
            return;
        }
        
        int requestedBoxId = doc["boxId"] | -1;
        String action = doc["action"] | "";
        
        // Kiểm tra box ID
        if (requestedBoxId != BOX_ID) {
            Serial.printf("[SERVER] Box ID mismatch: expected %d, got %d\n", BOX_ID, requestedBoxId);
            server.send(400, "application/json", "{\"success\":false,\"error\":\"Box ID mismatch\"}");
            return;
        }
        
        // Thực hiện action
        if (action == "UNLOCK") {
            unlockBox();
            
            // Gửi response thành công
            StaticJsonDocument<256> resDoc;
            resDoc["success"] = true;
            resDoc["boxId"] = BOX_ID;
            resDoc["status"] = "UNLOCKED";
            resDoc["message"] = "Box unlocked successfully";
            
            String response;
            serializeJson(resDoc, response);
            server.send(200, "application/json", response);
            
            // Báo cáo trạng thái về backend
            reportBoxStatus(STATUS_AVAILABLE, true);
        } else if (action == "LOCK") {
            lockBox();
            
            StaticJsonDocument<256> resDoc;
            resDoc["success"] = true;
            resDoc["boxId"] = BOX_ID;
            resDoc["status"] = "LOCKED";
            resDoc["message"] = "Box locked successfully";
            
            String response;
            serializeJson(resDoc, response);
            server.send(200, "application/json", response);
            
            reportBoxStatus(STATUS_LOCKED, false);
        } else {
            server.send(400, "application/json", "{\"success\":false,\"error\":\"Invalid action\"}");
        }
    } else {
        server.send(400, "application/json", "{\"success\":false,\"error\":\"No body\"}");
    }
}

/**
 * Handle status endpoint - Lấy trạng thái hiện tại
 * GET /status
 */
void handleStatus() {
    StaticJsonDocument<256> doc;
    doc["boxId"] = BOX_ID;
    doc["deviceId"] = DEVICE_ID;
    doc["isUnlocked"] = isUnlocked();
    doc["status"] = isUnlocked() ? "UNLOCKED" : "LOCKED";
    doc["uptime"] = millis() / 1000;
    doc["wifiRssi"] = WiFi.RSSI();
    doc["freeHeap"] = ESP.getFreeHeap();
    
    String response;
    serializeJson(doc, response);
    
    server.send(200, "application/json", response);
}

/**
 * Handle 404 - Not found
 */
void handleNotFound() {
    server.send(404, "application/json", "{\"error\":\"Not found\"}");
}

void setupServer() {
    server.on("/", HTTP_GET, handleRoot);
    server.on("/unlock", HTTP_POST, handleUnlock);
    server.on("/status", HTTP_GET, handleStatus);
    server.onNotFound(handleNotFound);
    
    server.begin();
    Serial.printf("[SERVER] HTTP server started on port %d\n", SERVER_PORT);
    Serial.println("[SERVER] Endpoints:");
    Serial.println("  GET  /         - Device info");
    Serial.println("  POST /unlock   - Unlock/Lock box");
    Serial.println("  GET  /status   - Current status");
}

// ============================================
// Main Functions
// ============================================

void setup() {
    // Khởi tạo Serial
    Serial.begin(115200);
    delay(1000);
    
    Serial.println("\n");
    Serial.println("========================================");
    Serial.println("   ESP32 Laundry Locker Controller");
    Serial.println("========================================");
    Serial.printf("Device ID: %s\n", DEVICE_ID);
    Serial.printf("Box ID: %d\n", BOX_ID);
    Serial.println("----------------------------------------");
    
    // Khởi tạo locker controller
    initLockerController();
    
    // Kết nối WiFi
    connectWiFi();
    
    // Khởi động HTTP server
    if (WiFi.status() == WL_CONNECTED) {
        setupServer();
        
        // Báo cáo trạng thái ban đầu
        reportBoxStatus(STATUS_AVAILABLE, false);
    }
    
    Serial.println("========================================");
    Serial.println("   Setup completed!");
    Serial.println("========================================\n");
}

void loop() {
    unsigned long currentMillis = millis();
    
    // Xử lý HTTP requests
    server.handleClient();
    
    // Kiểm tra auto-lock
    isUnlocked();
    
    // Kiểm tra kết nối WiFi định kỳ
    if (currentMillis - lastWiFiCheck >= WIFI_RECONNECT_INTERVAL) {
        lastWiFiCheck = currentMillis;
        checkWiFiConnection();
    }
    
    // Gửi status report định kỳ
    if (currentMillis - lastStatusReport >= STATUS_REPORT_INTERVAL) {
        lastStatusReport = currentMillis;
        BoxStatus status = isUnlocked() ? STATUS_OCCUPIED : STATUS_AVAILABLE;
        reportBoxStatus(status, isUnlocked());
    }
    
    // Nhỏ delay để không chiếm hết CPU
    delay(10);
}

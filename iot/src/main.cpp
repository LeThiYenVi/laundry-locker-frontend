/**
 * ESP8266 Laundry Locker IoT Controller
 * 
 * Main entry point - Điều khiển tủ giặt thông qua ESP8266
 * 
 * Chức năng:
 * - Kết nối WiFi
 * - Chạy HTTP server để nhận lệnh từ backend
 * - Phục vụ trang web kiosk cho nhập PIN mở khóa
 * - Điều khiển relay mở/khóa solenoid
 * - Gửi trạng thái về backend định kỳ
 * 
 * Hardware (ESP8266 NodeMCU):
 * - D1 (GPIO5): Relay control signal
 * - D2 (GPIO4): Button input
 * - D4 (GPIO2): Built-in LED
 * - 12V DC Adapter: Power for solenoid lock
 * - Relay module: Controls the solenoid
 */

#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <PubSubClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include "config.h"
#include "locker_controller.h"
#include "web_ui.h"

// ============================================
// Global Variables
// ============================================
ESP8266WebServer server(SERVER_PORT);
WiFiClient mqttWifiClient;
PubSubClient mqttClient(mqttWifiClient);
unsigned long lastStatusReport = 0;
unsigned long lastWiFiCheck = 0;
unsigned long lastMqttReconnect = 0;

// Button handling variables
unsigned long lastButtonPress = 0;
bool lastButtonState = HIGH;  // Pull-up: HIGH khi không nhấn

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
 * Handle root endpoint - Phục vụ trang web kiosk
 */
void handleRoot() {
    server.send(200, "text/html", FPSTR(LOCKER_UI_HTML));
}

/**
 * Handle API info endpoint - Thông tin thiết bị (JSON)
 */
void handleApiInfo() {
    StaticJsonDocument<256> doc;
    doc["device"] = DEVICE_ID;
    doc["boxId"] = BOX_ID;
    doc["lockerId"] = LOCKER_ID;
    doc["status"] = isUnlocked() ? "UNLOCKED" : "LOCKED";
    doc["uptime"] = millis() / 1000;
    doc["rssi"] = WiFi.RSSI();
    
    String response;
    serializeJson(doc, response);
    
    server.send(200, "application/json", response);
}

/**
 * Handle verify-and-unlock endpoint
 * Nhận PIN từ web UI → gọi backend xác thực → nếu hợp lệ, mở relay
 * POST /verify-and-unlock
 * Body: {"pinCode": "123456"}
 */
void handleVerifyAndUnlock() {
    Serial.println("[KIOSK] Received verify-and-unlock request");
    
    if (!server.hasArg("plain")) {
        server.send(400, "application/json", "{\"success\":false,\"message\":\"No body\"}");
        return;
    }
    
    String body = server.arg("plain");
    Serial.printf("[KIOSK] Body: %s\n", body.c_str());
    
    StaticJsonDocument<256> reqDoc;
    DeserializationError error = deserializeJson(reqDoc, body);
    
    if (error) {
        server.send(400, "application/json", "{\"success\":false,\"message\":\"Invalid JSON\"}");
        return;
    }
    
    String pinCode = reqDoc["pinCode"] | "";
    
    if (pinCode.length() != 6) {
        server.send(400, "application/json", "{\"success\":false,\"message\":\"PIN phải có 6 số\"}");
        return;
    }
    
    // Gọi backend để xác thực PIN
    Serial.println("[KIOSK] Calling backend to verify PIN...");
    
    WiFiClient client;
    HTTPClient http;
    String url = String(BACKEND_URL) + "/api/iot/verify-pin";
    
    http.begin(client, url);
    http.addHeader("Content-Type", "application/json");
    http.setTimeout(HTTP_TIMEOUT);
    
    // Tạo request body cho backend
    StaticJsonDocument<128> verifyReq;
    verifyReq["boxId"] = BOX_ID;
    verifyReq["pinCode"] = pinCode;
    
    String verifyBody;
    serializeJson(verifyReq, verifyBody);
    Serial.printf("[KIOSK] Backend request: %s\n", verifyBody.c_str());
    
    int httpCode = http.POST(verifyBody);
    
    if (httpCode <= 0) {
        Serial.printf("[KIOSK] Backend connection failed: %s\n", http.errorToString(httpCode).c_str());
        http.end();
        server.send(500, "application/json", "{\"success\":false,\"message\":\"Không thể kết nối server. Thử lại sau.\"}");
        return;
    }
    
    String backendResponse = http.getString();
    Serial.printf("[KIOSK] Backend response (%d): %s\n", httpCode, backendResponse.c_str());
    http.end();
    
    // Parse backend response
    StaticJsonDocument<512> resDoc;
    error = deserializeJson(resDoc, backendResponse);
    
    if (error) {
        Serial.println("[KIOSK] Failed to parse backend response");
        server.send(500, "application/json", "{\"success\":false,\"message\":\"Lỗi xử lý phản hồi từ server\"}");
        return;
    }
    
    // Kiểm tra kết quả xác thực
    // Backend trả về: {"success": true, "data": {"valid": true, ...}, "code": "PIN_VALID"}
    bool isValid = resDoc["data"]["valid"] | false;
    
    if (!isValid) {
        String msg = resDoc["data"]["message"] | "Mã PIN không hợp lệ";
        Serial.printf("[KIOSK] PIN invalid: %s\n", msg.c_str());
        
        StaticJsonDocument<256> errResp;
        errResp["success"] = false;
        errResp["message"] = msg;
        String errJson;
        serializeJson(errResp, errJson);
        server.send(200, "application/json", errJson);
        return;
    }
    
    // PIN hợp lệ - Mở khóa!
    Serial.println("[KIOSK] PIN valid! Unlocking box...");
    unlockBox();
    
    // Gửi response thành công
    long orderId = resDoc["data"]["orderId"] | 0;
    int boxNumber = resDoc["data"]["boxNumber"] | BOX_ID;
    
    StaticJsonDocument<256> successResp;
    successResp["success"] = true;
    successResp["message"] = "Đã mở khóa thành công! Hộp sẽ tự khóa sau 5 giây.";
    successResp["orderId"] = orderId;
    successResp["boxNumber"] = boxNumber;
    
    String successJson;
    serializeJson(successResp, successJson);
    server.send(200, "application/json", successJson);
    
    // Báo cáo trạng thái
    reportBoxStatus(STATUS_AVAILABLE, true);
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

// ============================================
// MQTT Functions
// ============================================

/**
 * MQTT message callback - xử lý lệnh từ backend
 * Topic: locker/commands/{DEVICE_ID}
 * Payload: {"box_id": 1, "action": "OPEN"} hoặc {"box_id": 1, "action": "LOCK"}
 */
void mqttCallback(char* topic, byte* payload, unsigned int length) {
    // Parse payload
    char msg[length + 1];
    memcpy(msg, payload, length);
    msg[length] = '\0';
    
    Serial.printf("[MQTT] Message on [%s]: %s\n", topic, msg);
    
    StaticJsonDocument<256> doc;
    DeserializationError err = deserializeJson(doc, msg);
    if (err) {
        Serial.printf("[MQTT] JSON parse error: %s\n", err.c_str());
        return;
    }
    
    int cmdBoxId = doc["box_id"] | -1;
    const char* action = doc["action"] | "";
    
    // Kiểm tra box_id có đúng box này không
    if (cmdBoxId != BOX_ID) {
        Serial.printf("[MQTT] Ignored: box_id %d != my BOX_ID %d\n", cmdBoxId, BOX_ID);
        return;
    }
    
    if (strcmp(action, "OPEN") == 0) {
        Serial.println("[MQTT] >>> OPEN command received! Unlocking...");
        unlockBox();
        
        // Publish status update
        StaticJsonDocument<128> status;
        status["box_id"] = BOX_ID;
        status["status"] = "UNLOCKED";
        status["device"] = DEVICE_ID;
        char statusMsg[128];
        serializeJson(status, statusMsg);
        mqttClient.publish(MQTT_TOPIC_STATUS, statusMsg);
        
    } else if (strcmp(action, "LOCK") == 0) {
        Serial.println("[MQTT] >>> LOCK command received! Locking...");
        lockBox();
        
        StaticJsonDocument<128> status;
        status["box_id"] = BOX_ID;
        status["status"] = "LOCKED";
        status["device"] = DEVICE_ID;
        char statusMsg[128];
        serializeJson(status, statusMsg);
        mqttClient.publish(MQTT_TOPIC_STATUS, statusMsg);
        
    } else {
        Serial.printf("[MQTT] Unknown action: %s\n", action);
    }
}

/**
 * Kết nối tới MQTT Broker và subscribe topic lệnh
 */
void connectMQTT() {
    mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
    mqttClient.setCallback(mqttCallback);
    
    String clientId = String(DEVICE_ID) + "_" + String(random(0xffff), HEX);
    Serial.printf("[MQTT] Connecting to %s:%d as %s...\n", MQTT_BROKER, MQTT_PORT, clientId.c_str());
    
    bool connected;
    if (strlen(MQTT_USER) > 0) {
        connected = mqttClient.connect(clientId.c_str(), MQTT_USER, MQTT_PASSWORD);
    } else {
        connected = mqttClient.connect(clientId.c_str());
    }
    
    if (connected) {
        Serial.println("[MQTT] Connected!");
        mqttClient.subscribe(MQTT_TOPIC_CMD);
        Serial.printf("[MQTT] Subscribed to: %s\n", MQTT_TOPIC_CMD);
        
        // Publish online status
        StaticJsonDocument<128> status;
        status["box_id"] = BOX_ID;
        status["status"] = "ONLINE";
        status["device"] = DEVICE_ID;
        status["ip"] = WiFi.localIP().toString();
        char statusMsg[128];
        serializeJson(status, statusMsg);
        mqttClient.publish(MQTT_TOPIC_STATUS, statusMsg);
    } else {
        Serial.printf("[MQTT] Failed, rc=%d. Retry in %ds\n", mqttClient.state(), MQTT_RECONNECT_INTERVAL / 1000);
    }
}

// ============================================
// Backend API Proxy Handlers
// ESP8266 forwards web UI requests to backend
// ============================================

/**
 * Generic proxy: forward request to backend API
 * Reads Authorization header and body from web client,
 * forwards to backend, returns response.
 */
void proxyToBackend(const char* method, const String& backendPath, const String& bodyOverride = "") {
    String body = bodyOverride.length() > 0 ? bodyOverride 
                 : (server.hasArg("plain") ? server.arg("plain") : "");
    String auth = server.header("Authorization");
    
    WiFiClient wifiClient;
    HTTPClient http;
    String url = String(BACKEND_URL) + backendPath;
    
    Serial.printf("[PROXY] %s %s\n", method, url.c_str());
    
    http.begin(wifiClient, url);
    http.addHeader("Content-Type", "application/json");
    if (auth.length() > 0) {
        http.addHeader("Authorization", auth);
    }
    http.setTimeout(HTTP_TIMEOUT);
    
    int httpCode;
    String methodStr = String(method);
    if (methodStr == "GET") httpCode = http.GET();
    else if (methodStr == "PUT") httpCode = http.PUT(body);
    else httpCode = http.POST(body);
    
    if (httpCode > 0) {
        String response = http.getString();
        server.send(httpCode, "application/json", response);
        Serial.printf("[PROXY] Response: %d\n", httpCode);
    } else {
        Serial.printf("[PROXY] Error: %s\n", http.errorToString(httpCode).c_str());
        server.send(502, "application/json", 
            "{\"success\":false,\"message\":\"Không thể kết nối server\"}");
    }
    http.end();
}

// Auth proxy handlers
void handleProxySendOtp() { proxyToBackend("POST", "/api/auth/email/send-otp"); }
void handleProxyVerifyOtp() { proxyToBackend("POST", "/api/auth/email/verify-otp"); }
void handleProxyRegister() { proxyToBackend("POST", "/api/auth/email/complete-registration"); }

void setupServer() {
    // Collect Authorization header from requests
    server.collectHeaders("Authorization");
    
    // Core endpoints
    server.on("/", HTTP_GET, handleRoot);
    server.on("/api/info", HTTP_GET, handleApiInfo);
    server.on("/verify-and-unlock", HTTP_POST, handleVerifyAndUnlock);
    server.on("/unlock", HTTP_POST, handleUnlock);
    server.on("/status", HTTP_GET, handleStatus);
    
    // Auth proxy endpoints (for kiosk login/register)
    server.on("/api/proxy/send-otp", HTTP_POST, handleProxySendOtp);
    server.on("/api/proxy/verify-otp", HTTP_POST, handleProxyVerifyOtp);
    server.on("/api/proxy/register", HTTP_POST, handleProxyRegister);
    
    server.onNotFound(handleNotFound);
    
    server.begin();
    Serial.printf("[SERVER] HTTP server started on port %d\n", SERVER_PORT);
    Serial.println("[SERVER] Endpoints:");
    Serial.println("  GET  /                       - Kiosk Web UI");
    Serial.println("  GET  /api/info               - Device info");
    Serial.println("  POST /verify-and-unlock       - PIN verify & unlock");
    Serial.println("  POST /unlock                  - Direct unlock/lock");
    Serial.println("  GET  /status                  - Current status");
    Serial.println("  POST /api/proxy/send-otp      - Auth: Send OTP");
    Serial.println("  POST /api/proxy/verify-otp    - Auth: Verify OTP");
    Serial.println("  POST /api/proxy/register      - Auth: Register");
}

// ============================================
// Button Handling
// ============================================

/**
 * Kiểm tra nút nhấn và toggle trạng thái khóa
 * Sử dụng debounce để tránh bấm nhiều lần
 */
void handleButton() {
    bool currentButtonState = digitalRead(BUTTON_PIN);
    
    // Phát hiện cạnh xuống (HIGH -> LOW) với debounce
    if (currentButtonState == LOW && lastButtonState == HIGH) {
        unsigned long currentTime = millis();
        
        if (currentTime - lastButtonPress >= BUTTON_DEBOUNCE_TIME) {
            lastButtonPress = currentTime;
            
            // Toggle trạng thái khóa
            if (isUnlocked()) {
                Serial.println("[BUTTON] Button pressed - Locking box");
                lockBox();
                reportBoxStatus(STATUS_LOCKED, false);
            } else {
                Serial.println("[BUTTON] Button pressed - Unlocking box");
                unlockBox();
                reportBoxStatus(STATUS_AVAILABLE, true);
            }
        }
    }
    
    lastButtonState = currentButtonState;
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
    Serial.println("   ESP8266 Laundry Locker Controller");
    Serial.println("========================================");
    Serial.printf("Device ID: %s\n", DEVICE_ID);
    Serial.printf("Box ID: %d\n", BOX_ID);
    Serial.println("----------------------------------------");
    
    // Khởi tạo locker controller
    initLockerController();
    
    // Khởi tạo nút nhấn với pull-up
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    Serial.printf("[BUTTON] Button pin: GPIO%d\n", BUTTON_PIN);
    
    // Kết nối WiFi
    connectWiFi();
    
    // Khởi động HTTP server
    if (WiFi.status() == WL_CONNECTED) {
        setupServer();
        
        // Kết nối MQTT
        connectMQTT();
        
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
    
    // Xử lý MQTT
    if (mqttClient.connected()) {
        mqttClient.loop();
    } else if (currentMillis - lastMqttReconnect >= MQTT_RECONNECT_INTERVAL) {
        lastMqttReconnect = currentMillis;
        Serial.println("[MQTT] Reconnecting...");
        connectMQTT();
    }
    
    // Xử lý nút nhấn
    handleButton();
    
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

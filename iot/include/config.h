/**
 * ESP8266 Laundry Locker IoT Configuration
 * 
 * Cấu hình WiFi, Backend và GPIO pins cho hệ thống khóa tủ giặt
 * 
 * !!! QUAN TRỌNG: Thay đổi thông tin WiFi và Backend trước khi upload !!!
 */

#ifndef CONFIG_H
#define CONFIG_H

// ============================================
// WiFi Configuration
// ============================================
#define WIFI_SSID "Thai Binh"              // Thay bằng tên WiFi của bạn
#define WIFI_PASSWORD "thaibinh7704"      // Thay bằng mật khẩu WiFi

// ============================================
// Backend API Configuration
// ============================================
#define BACKEND_URL "http://192.168.1.10:8080"  // IP của máy chạy backend Docker
#define HTTP_TIMEOUT 10000  // Timeout 10 giây

// ============================================
// Box/Device Configuration
// ============================================
#define BOX_ID 1                                // ID của box mà ESP8266 này điều khiển
#define LOCKER_ID 1                             // ID của locker chứa box này
#define DEVICE_ID "ESP8266_LOCKER_01"           // ID định danh của thiết bị

// ============================================
// GPIO Pin Configuration (ESP8266 NodeMCU)
// ============================================
// NodeMCU GPIO mapping: D0=16, D1=5, D2=4, D3=0, D4=2, D5=14, D6=12, D7=13, D8=15
#define RELAY_PIN 5         // D1 (GPIO5) - Điều khiển Relay
#define BUTTON_PIN 4        // D2 (GPIO4) - Nút nhấn toggle
#define LED_STATUS 2        // D4 (GPIO2) - LED trạng thái (built-in LED, active LOW)

// ============================================
// Timing Configuration
// ============================================
#define UNLOCK_DURATION 5000        // Thời gian mở khóa (ms): 5 giây
#define STATUS_REPORT_INTERVAL 30000   // Gửi status lên backend mỗi 30 giây
#define WIFI_RECONNECT_INTERVAL 10000  // Thử kết nối lại WiFi sau 10 giây
#define BUTTON_DEBOUNCE_TIME 200       // Debounce cho nút nhấn (ms)

// ============================================
// HTTP Server Configuration (ESP8266 Server)
// ============================================
#define SERVER_PORT 80  // Port cho HTTP server trên ESP8266

// ============================================
// Relay Logic
// ============================================
// Relay thường sử dụng active LOW (bật khi LOW, tắt khi HIGH)
// Thay đổi nếu relay của bạn hoạt động khác
#define RELAY_ACTIVE_LOW false  // Thử đổi thành false nếu relay không hoạt động

// ============================================
// MQTT Configuration
// ============================================
#define MQTT_BROKER "broker.hivemq.com"      // MQTT Broker (thay bằng broker riêng nếu có)
#define MQTT_PORT 1883                        // MQTT Port
#define MQTT_USER ""                          // Username (để trống nếu public broker)
#define MQTT_PASSWORD ""                      // Password (để trống nếu public broker)

// MQTT Topics - dựa trên DEVICE_ID
// Command topic: backend gửi lệnh mở khóa tới ESP
// Status topic: ESP gửi trạng thái về cho backend
#define MQTT_TOPIC_CMD "locker/commands/" DEVICE_ID
#define MQTT_TOPIC_STATUS "locker/status/" DEVICE_ID
#define MQTT_RECONNECT_INTERVAL 5000          // Thử kết nối lại MQTT sau 5 giây

#endif // CONFIG_H

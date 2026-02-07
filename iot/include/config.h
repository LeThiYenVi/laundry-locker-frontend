/**
 * ESP32 Laundry Locker IoT Configuration
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
#define WIFI_SSID "YOUR_WIFI_SSID"              // Thay bằng tên WiFi của bạn
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"      // Thay bằng mật khẩu WiFi

// ============================================
// Backend API Configuration
// ============================================
#define BACKEND_URL "http://192.168.1.100:8080"  // Thay bằng IP của backend server
#define HTTP_TIMEOUT 10000  // Timeout 10 giây

// ============================================
// Box/Device Configuration
// ============================================
#define BOX_ID 1                                // ID của box mà ESP32 này điều khiển
#define DEVICE_ID "ESP32_LOCKER_01"             // ID định danh của thiết bị

// ============================================
// GPIO Pin Configuration (Theo sơ đồ mạch)
// ============================================
#define RELAY_PIN 22        // GPIO22 - Điều khiển Relay
#define LED_STATUS 2        // GPIO2 - LED trạng thái (built-in LED)

// ============================================
// Timing Configuration
// ============================================
#define UNLOCK_DURATION 5000        // Thời gian mở khóa (ms): 5 giây
#define STATUS_REPORT_INTERVAL 30000   // Gửi status lên backend mỗi 30 giây
#define WIFI_RECONNECT_INTERVAL 10000  // Thử kết nối lại WiFi sau 10 giây

// ============================================
// HTTP Server Configuration (ESP32 Server)
// ============================================
#define SERVER_PORT 80  // Port cho HTTP server trên ESP32

// ============================================
// Relay Logic
// ============================================
// Relay thường sử dụng active LOW (bật khi LOW, tắt khi HIGH)
// Thay đổi nếu relay của bạn hoạt động khác
#define RELAY_ACTIVE_LOW true

#endif // CONFIG_H

# 🔥 BACKEND NETWORK ERROR - GIẢI PHÁP

## ❌ Vấn Đề

Backend đang chạy trên `localhost:8080` nhưng **CHỈ listening trên 127.0.0.1**, không accept connections từ emulator (`10.0.2.2`).

**Logs xác nhận:**
```
✅ API URL: http://10.0.2.2:8080/api (ĐÚNG)
✅ Environment variables loaded (ĐÚNG)
❌ Network Error (Backend không accept 10.0.2.2)
```

---

## ✅ GIẢI PHÁP

### **Option 1: Sửa Backend (Khuyến nghị cho Production)**

Backend cần bind `0.0.0.0` thay vì `127.0.0.1`:

**Spring Boot** (`application.properties` hoặc `application.yml`):
```properties
server.address=0.0.0.0
server.port=8080
```

Sau đó restart backend.

---

### **Option 2: Port Forwarding (Workaround Nhanh)**

Dùng `adb` để forward port:

```bash
adb reverse tcp:8080 tcp:8080
```

Sau đó đổi `.env`:
```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

**Giải thích:** 
- `adb reverse` làm cho `localhost:8080` trong emulator trỏ đến `localhost:8080` của máy host
- Không cần `10.0.2.2` nữa

---

### **Option 3: Dùng IP Thật của Máy**

Nếu backend có thể accept connections từ mạng:

1. Tìm IP máy:
```bash
ipconfig
```

2. Đổi `.env`:
```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8080/api
```

(Thay `192.168.x.x` bằng IP thật của bạn)

---

## 🎯 KHUYẾN NGHỊ

**Để test nhanh ngay bây giờ:**

### Bước 1: Port Forward
```bash
adb reverse tcp:8080 tcp:8080
```

### Bước 2: Đổi `.env`
```env
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

### Bước 3: Restart App
```bash
# Ctrl+C stop Metro
npm run android
```

### Bước 4: Test Login
- Số: `900000001`
- OTP: `123456`
- **THÀNH CÔNG!** 🎉

---

## 📌 LƯU Ý

**Sau khi port forward:**
- ✅ Emulator có thể dùng `localhost:8080`
- ✅ Không cần `10.0.2.2` nữa
- ✅ Backend không cần thay đổi
- ⚠️ Phải chạy `adb reverse` mỗi lần khởi động lại emulator

---

## 🔄 Reset Nếu Cần

Nếu muốn revert:
```bash
adb reverse --remove tcp:8080
```

Sau đó đổi lại `.env`:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api
```

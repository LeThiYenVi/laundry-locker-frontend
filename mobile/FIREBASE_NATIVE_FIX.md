# Fix Lỗi Firebase Native Module

## ❌ Vấn đề

```
Native module RNFBAppModule not found.
Re-check module install, linking, configuration, build and install steps.
```

## 🔍 Nguyên nhân

**Expo Go KHÔNG hỗ trợ Firebase native modules!**

Firebase cần các native code (Java/Kotlin cho Android, Swift/Objective-C cho iOS), nhưng Expo Go chỉ chứa các module cơ bản được build sẵn. Bạn không thể thêm custom native modules vào Expo Go.

## ✅ Giải pháp: Dùng Development Build

### **1. Build Development Build (đang chạy...)**

```bash
npx expo run:android
```

Lệnh này sẽ:

- Compile toàn bộ native code (bao gồm Firebase)
- Cài đặt app development build lên thiết bị
- Tự động kết nối với Metro bundler

### **2. Sau khi build xong**

App sẽ tự động cài đặt lên thiết bị Android. Bạn sẽ thấy:

- **Icon app**: "Laundry Locker"
- **KHÔNG phải Expo Go icon**
- App có thể sử dụng Firebase phone authentication

### **3. Chạy lại khi cần**

**Chỉ cần rebuild khi:**

- Thay đổi native code
- Thêm/xóa native dependencies
- Thay đổi app.json/google-services.json

**Không cần rebuild khi:**

- Thay đổi JavaScript/TypeScript code
- Thay đổi UI/logic
- Fix bug thường

Chỉ cần chạy Metro:

```bash
npx expo start --dev-client
```

Sau đó nhấn `a` để reload app.

## 📋 So sánh

| Feature        | Expo Go            | Development Build         |
| -------------- | ------------------ | ------------------------- |
| Firebase Auth  | ❌ Không hỗ trợ    | ✅ Đầy đủ                 |
| Native Modules | ❌ Giới hạn        | ✅ Tất cả                 |
| Setup Time     | ⚡ Nhanh (scan QR) | 🕐 Lâu (build 5-10 phút)  |
| Update Code    | ⚡ Instant         | ⚡ Instant (Metro reload) |
| APK Size       | 📦 Nhẹ (30MB)      | 📦 Nặng hơn (50-80MB)     |

## 🎯 Khuyến nghị

**Dùng Development Build cho dự án này** vì cần:

- ✅ Firebase Phone Authentication
- ✅ Firebase Cloud Messaging (nếu có)
- ✅ Custom native modules khác

## 🐛 Troubleshooting

### Build failed với CMake error

```bash
# Clean toàn bộ
Remove-Item -Path "android\.gradle" -Recurse -Force
Remove-Item -Path "android\app\build" -Recurse -Force
Remove-Item -Path "android\build" -Recurse -Force
Remove-Item -Path "android\app\.cxx" -Recurse -Force

# Rebuild
npx expo run:android
```

### App crashes sau khi mở

- Kiểm tra `google-services.json` có trong `android/app/`
- Kiểm tra Firebase console có enable Phone Auth
- Xem logcat: `adb logcat | grep -i firebase`

### Build quá lâu

- Lần đầu build sẽ mất 10-15 phút
- Các lần sau nhanh hơn (3-5 phút)
- Dùng Gradle daemon để tăng tốc

## 🚀 Next Steps

Sau khi build xong:

1. App tự động mở trên thiết bị
2. Test login với số test: `+84 900000001`
3. Nhập OTP bất kỳ (6 số)
4. Kiểm tra flow hoàn chỉnh: Login → Register → Home

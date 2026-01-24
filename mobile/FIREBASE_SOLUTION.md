# 🔥 GIẢI PHÁP: Sửa Lỗi Firebase Authentication

## 🚨 Lỗi Hiện Tại
```
Error: [auth/app-not-authorized] 
Invalid app info in play_integrity_token
```

## 🎯 Nguyên Nhân
Lỗi này do **Firebase App Check** hoặc **Play Integrity API** đang blocking ứng dụng trong development mode.

---

## ✅ GIẢI PHÁP 1: Disable App Check (Khuyến nghị cho Development)

### Bước 1: Vào Firebase Console
1. Mở: https://console.firebase.google.com/
2. Chọn project: **laundry-locker-19a9d**

### Bước 2: Tắt App Check
1. Sidebar trái → Click **"App Check"**
2. Nếu thấy App Check đang enabled:
   - Click vào Android app của bạn
   - Tìm toggle **"Enforcement"**
   - **DISABLE** enforcement cho tất cả services (Authentication, etc.)

### Bước 3: Hoặc thêm Debug Provider
Nếu bạn muốn giữ App Check enabled:
1. Trong App Check → Click Android app
2. Scroll xuống **"Debug tokens"**
3. Click **"Add debug token"**
4. Chạy lệnh để lấy debug token (xem phía dưới)

---

## ✅ GIẢI PHÁP 2: Thêm SHA Certificate (Nếu chưa thêm)

### Xác nhận SHA đã thêm vào Firebase:

1. Firebase Console → **Project Settings** (⚙️)
2. Scroll xuống **"Your apps"**
3. Click Android app: `com.laundrylocker.mobile`
4. Kiểm tra **"SHA certificate fingerprints"**

**PHẢI CÓ ÍT NHẤT 1 trong 2 SHA này:**

#### Debug SHA-1:
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```

#### Release SHA-1:
```
EF:32:59:FA:F0:EC:97:B3:0C:7E:39:B5:1E:2F:BA:F9:F0:DC:EA:D7
```

### Nếu CHƯA CÓ SHA nào:
1. Click **"Add fingerprint"**
2. Paste Debug SHA-1 ở trên
3. **QUAN TRỌNG**: Download lại `google-services.json` MỚI
4. Thay thế file `android/app/google-services.json`
5. Rebuild app

---

## ✅ GIẢI PHÁP 3: Enable Authentication Methods

1. Firebase Console → **Authentication**
2. Tab **"Sign-in method"**
3. Đảm bảo các phương thức sau được **ENABLED**:

- ✅ **Phone** → Status: Enabled
- ✅ **Email/Password** → Status: Enabled  
- ✅ **Google** → Status: Enabled (nếu dùng OAuth)

---

## 🛠️ Script Tự Động Kiểm Tra

Chạy script này để tự động debug:

```bash
# Kiểm tra SHA của keystore hiện tại
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Xem package name trong app
grep "applicationId" android/app/build.gradle

# Xem google-services.json
cat android/app/google-services.json | grep "package_name"
```

---

## 🔄 Rebuild App Sau Khi Fix

```bash
# Stop app hiện tại (nếu đang chạy)
# Ctrl+C trong terminal

# Clean build
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

---

## 📋 CHECKLIST CỤ THỂ

Hãy làm theo thứ tự:

### [ ] 1. Kiểm tra App Check
- Vào Firebase Console → App Check
- Nếu có App Check enabled → **Disable Enforcement**

### [ ] 2. Kiểm tra SHA Certificates  
- Vào Project Settings → Your apps → Android
- Kiểm tra có SHA fingerprint chưa
- Nếu chưa → Add SHA: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

### [ ] 3. Download google-services.json mới
- Sau khi add SHA → Download file mới
- Thay thế `android/app/google-services.json`

### [ ] 4. Kiểm tra Authentication  
- Vào Authentication → Sign-in method
- Enable: Phone, Email/Password

### [ ] 5. Rebuild app
```bash
cd android && ./gradlew clean && cd .. && npm run android
```

---

## 🎯 Kết Quả Mong Đợi

Sau khi làm xong, bạn sẽ:
- ✅ Không còn lỗi "app-not-authorized"
- ✅ Có thể gửi OTP qua Phone
- ✅ Có thể gửi OTP qua Email
- ✅ Đăng nhập thành công

---

## 💡 LƯU Ý QUAN TRỌNG

1. **App Check**: Nên tắt trong development, bật khi production
2. **SHA Certificate**: Debug SHA khác với Release SHA
3. **google-services.json**: PHẢI download lại sau mỗi lần thay đổi trong Firebase Console
4. **Rebuild**: PHẢI clean build sau khi thay google-services.json

---

## ❓ Nếu Vẫn Lỗi

Gửi cho tôi screenshot của:
1. Firebase Console → App Check (nếu có)
2. Firebase Console → Project Settings → Your apps → SHA certificates
3. Firebase Console → Authentication → Sign-in method

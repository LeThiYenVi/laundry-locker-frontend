# 🔥 URGENT: Tắt Firebase App Check Ngay

## ❌ Lỗi: `Invalid app info in play_integrity_token`

Đây là lỗi **Firebase App Check** đang chặn ứng dụng development của bạn.

---

## ✅ GIẢI PHÁP DUY NHẤT: Tắt App Check trong Firebase Console

### Bước 1: Mở Firebase Console
https://console.firebase.google.com/project/laundry-locker-19a9d/appcheck

### Bước 2: Click vào "App Check" trong sidebar trái

### Bước 3: Tìm Android App của bạn
- Package: `com.laundrylocker.mobile`

### Bước 4: Tắt Enforcement
Bạn sẽ thấy một switch/toggle có label **"Enforce App Check"** hoặc **"Enforcement"**

**→ TOGGLE NÓ RA "OFF" hoặc "DISABLED"**

### Bước 5: Rebuild App

Sau khi tắt App Check:

```bash
# Clean và rebuild
cd android
./gradlew clean
cd ..
npm run android
```

---

## 📸 Hình Minh Họa

1. Firebase Console → Sidebar → **App Check**
2. Tìm Android app (`com.laundrylocker.mobile`)
3. Toggle **"Enforcement"** → **OFF**
4. Rebuild app

---

## ⚠️ TẠI SAO PHẢI LÀM VẬY?

App Check là một tính năng bảo mật của Firebase để chặn các request từ app không hợp lệ. Tuy nhiên:

- ❌ Trong **development/debug** build → App Check sẽ FAIL (vì không có Play Integrity)
- ✅ Trong **production/release** build → App Check hoạt động bình thường

**Vì vậy**: 
- Tắt App Check khi đang development
- Bật lại khi release production

---

## 🎯 SAU KHI TẮT APP CHECK

Bạn sẽ có thể:
- ✅ Gửi OTP qua Phone
- ✅ Gửi OTP qua Email
- ✅ Login thành công
- ✅ Không còn lỗi "app-not-authorized"

---

## 💡 LƯU Ý

Nếu bạn KHÔNG thấy App Check trong Firebase Console:
→ Có nghĩa là Firebase đang có issue khác

Hãy kiểm tra lại:
1. **Authentication** có enabled không?
   - Firebase Console → Authentication → Click "Get Started" nếu chưa enable
   
2. **Phone Sign-In** có enabled không?
   - Authentication → Sign-in method → Enable "Phone"

3. **SHA Certificate** đã thêm chưa?
   - Project Settings → Your apps → Android app → Add fingerprint:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```

---

## 🚀 QUICK ACTION

**Link trực tiếp vào App Check:**
https://console.firebase.google.com/project/laundry-locker-19a9d/appcheck

1. Click link trên
2. Tắt Enforcement
3. Rebuild app
4. XONG!

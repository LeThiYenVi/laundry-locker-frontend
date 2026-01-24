# ✅ Firebase Authentication Setup Checklist

## 🔥 Bạn cần kiểm tra trong Firebase Console

### 1. Authentication có được Enable không?
1. Mở Firebase Console: https://console.firebase.google.com/
2. Chọn project: **laundry-locker-19a9d**
3. Sidebar trái → Click **"Authentication"** (biểu tượng người dùng)
4. Nếu thấy nút **"Get Started"** → Click để enable
5. Nếu đã enable, bạn sẽ thấy tabs: Users, Sign-in method, Templates, Usage

### 2. Phone Sign-In Method có được Enable không?
1. Trong Authentication → Click tab **"Sign-in method"**
2. Tìm **"Phone"** trong danh sách providers
3. Check xem Status có phải là **"Enabled"** không
4. Nếu chưa:
   - Click vào "Phone"
   - Toggle **"Enable"**
   - Click **"Save"**

### 3. Email/Password có được Enable không? (nếu dùng email login)
1. Trong Authentication → tab **"Sign-in method"**
2. Tìm **"Email/Password"**
3. Status phải là **"Enabled"**
4. Nếu chưa → Enable nó

### 4. Google Sign-In có được Enable không? (nếu dùng OAuth)
1. Trong Authentication → tab **"Sign-in method"**
2. Tìm **"Google"**
3. Status phải là **"Enabled"**
4. Nếu chưa:
   - Click "Google"
   - Enable
   - Chọn Support email
   - Save

---

## 📱 Sau khi kiểm tra Firebase Console

Chạy lệnh này để rebuild app:

```bash
npm run android
```

Hoặc nếu vẫn lỗi, force clean rebuild:

```bash
# Stop current build (Ctrl+C)
cd android
./gradlew clean
./gradlew assembleDebug --refresh-dependencies
cd ..
npm run android
```

---

## 🔍 Các điểm đã kiểm tra (OK ✅)

✅ Package name: `com.laundrylocker.mobile` - ĐÚNG
✅ google-services.json ở đúng vị trí: `android/app/`
✅ Google Services plugin đã apply trong build.gradle
✅ SHA certificates có trong google-services.json
✅ Clean build đã chạy xong

---

## ⚠️ Lỗi phổ biến

### Lỗi: "app-not-authorized"
**Nguyên nhân**:
- Authentication chưa enable trong Firebase Console
- Phone sign-in method chưa enable
- SHA certificate chưa match (nhưng bạn đã fix rồi)

### Lỗi: "quota-exceeded"  
**Nguyên nhân**: Đã gửi quá nhiều SMS test trong ngày
**Giải pháp**: Chờ 24h hoặc dùng test phone number trong Firebase Console

### Lỗi: "invalid-phone-number"
**Nguyên nhân**: Format số điện thoại sai
**Giải pháp**: Đảm bảo format +84xxxxxxxxx

---

## 🎯 Test Plan

Sau khi rebuild xong:

### Test Phone Login:
1. Mở app → màn hình Login
2. Chọn tab "Số điện thoại"
3. Nhập: `987654321` (tự động thành +84987654321)
4. Click "Gửi mã OTP"
5. Nhập OTP từ SMS
6. Click "Xác nhận"

### Test Email Login:
1. Chọn tab "Email"
2. Nhập email của bạn
3. Click "Gửi mã OTP"
4. Check email để lấy OTP
5. Nhập OTP
6. Click "Xác nhận"

### Test Google Login:
1. Click icon Google (màu đỏ) ở dưới
2. Chọn tài khoản Google
3. Cho phép quyền
4. Đợi redirect về app

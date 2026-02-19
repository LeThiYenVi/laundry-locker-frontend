# Debug Registration Error 500

## 🔴 Lỗi hiện tại

```
Status: 500
Code: E_COM001
Message: An unexpected error occurred.
```

## 🔍 Phân tích

Lỗi 500 từ backend có thể do:

### 1. **Token không hợp lệ** (Khả năng cao nhất)

- Firebase ID token đã hết hạn (thường sau 1 giờ)
- Token không được backend nhận diện
- Format token không đúng

### 2. **Backend validation error**

- Thiếu field bắt buộc
- Format date không đúng
- Backend expect format khác

### 3. **Backend database issue**

- Không tìm thấy user với token
- Constraint violation
- Connection pool exhausted

## ✅ Đã fix trong code

### 1. **Thêm request logging**

File: `services/api.ts`

```typescript
// Bây giờ sẽ log:
// - Full URL
// - Method
// - Request data
// - Auth header status
```

### 2. **Cải thiện error handling**

File: `app/(auth)/register.tsx`

```typescript
// Bây giờ hiển thị:
// - Lỗi 500 với E_COM001: "Token không hợp lệ, đăng nhập lại"
// - Tự động redirect về login sau 3s
// - Chi tiết error trong console
```

## 🧪 Cách debug

### Bước 1: Xem log đầy đủ trong terminal

Sau khi nhấn "Hoàn tất đăng ký", xem console:

```
LOG  API Request: {
  method: "POST",
  url: "/auth/complete-registration",
  baseURL: "http://10.0.2.2:8082/api",
  fullURL: "http://10.0.2.2:8082/api/auth/complete-registration",
  data: {
    idToken: "eyJhbGc...", // hoặc
    tempToken: "...",
    firstName: "...",
    lastName: "...",
    birthday: "2004-11-11"
  },
  hasAuth: false
}
```

### Bước 2: Kiểm tra backend logs

Mở backend terminal và xem stack trace:

```bash
# Tìm error trong backend logs
# Sẽ thấy line nào throw exception
```

### Bước 3: Verify API với curl/Postman

```bash
# Copy idToken từ log
# Test trực tiếp
curl -X POST http://localhost:8082/api/auth/complete-registration \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_ID_TOKEN_HERE",
    "firstName": "Duy",
    "lastName": "Nguyen",
    "birthday": "2004-11-11"
  }'
```

## 🎯 Các kịch bản có thể

### Kịch bản 1: Token hết hạn

**Triệu chứng:** 500 error sau khi nhập OTP xong
**Giải pháp:** Login lại từ đầu

### Kịch bản 2: Backend expect tempToken không phải idToken

**Triệu chứng:** Backend không nhận diện được field
**Giải pháp:** Backend phải trả về `tempToken` trong phone-login response

### Kịch bản 3: Birthday format sai

**Triệu chứng:** Validation error
**Giải pháp:** Đảm bảo format `YYYY-MM-DD`

### Kịch bản 4: Missing user record

**Triệu chứng:** Backend không tìm thấy pending user
**Giải pháp:** Backend phải tạo pending user sau phone-login

## 🔧 Khắc phục tạm thời

### Nếu là vấn đề token:

**Option 1:** Backend trả về tempToken

```typescript
// Backend should return in /auth/phone-login:
{
  newUser: true,
  tempToken: "some-session-id", // <-- Cần có
  accessToken: null,
  refreshToken: null
}
```

**Option 2:** Sử dụng Firebase ID token trực tiếp

```typescript
// Backend accept idToken trong complete-registration:
{
  idToken: "firebase-jwt-token",
  firstName: "...",
  lastName: "...",
  birthday: "..."
}
```

## 📝 Checklist để fix

- [ ] Backend có trả về `tempToken` trong phone-login response?
- [ ] Backend có accept `idToken` trong complete-registration?
- [ ] Backend có tạo pending user sau phone-login?
- [ ] Token có expire time hợp lý? (ít nhất 10 phút)
- [ ] Database có constraint nào vi phạm?
- [ ] Backend có log chi tiết error?

## 🚀 Next Steps

1. **Chạy app với logging mới:**

   ```bash
   npx expo start --dev-client
   ```

2. **Thử đăng ký lại**, xem log chi tiết:
   - Request data
   - Backend response
   - Error code

3. **Báo backend team:**
   - Copy full error log
   - Copy request data
   - Mô tả các bước reproduce

4. **Nếu cần workaround tạm thời:**
   - Có thể disable registration
   - Hoặc dùng email login thay vì phone

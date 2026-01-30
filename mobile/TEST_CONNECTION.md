# Hướng dẫn fix lỗi và test connection

## Vấn đề đã fix:

### 1. Firebase Native Module Error

**Lỗi:** `Native module RNFBAppModule not found`

**Nguyên nhân:** Firebase native modules chưa được link đúng sau khi cài đặt

**Giải pháp:**

```bash
# Xóa build cache
Remove-Item -Path "android\.gradle" -Recurse -Force
Remove-Item -Path "android\app\build" -Recurse -Force
Remove-Item -Path "android\build" -Recurse -Force
Remove-Item -Path "android\app\.cxx" -Recurse -Force

# Rebuild app
npx expo run:android
```

### 2. Network Error khi gọi API

**Lỗi:** `AxiosError: Network Error`

**Đã thêm:**

- Tăng timeout từ 30s → 60s
- Logging chi tiết URL và lỗi
- Xử lý lỗi network cụ thể

### 3. Registration Error

**Lỗi:** `Phiên đăng ký không hợp lệ`

**Đã thêm:**

- Logging tempToken để debug
- Xử lý lỗi chi tiết hơn
- Thông báo lỗi cụ thể theo status code

## Kiểm tra Backend:

### Cách 1: Kiểm tra backend có đang chạy không

```bash
# Từ PowerShell
curl http://10.0.2.2:8082/api/auth/phone-login

# Hoặc
curl http://localhost:8082/api/auth/phone-login
```

### Cách 2: Kiểm tra port đúng chưa

Nếu backend chạy ở port khác (ví dụ 8080), cập nhật `.env`:

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api
```

### Cách 3: Kiểm tra log trong app

Sau khi fix, app sẽ hiển thị các log:

- `API Base URL:` - URL đang được dùng
- `Calling backend API at:` - Xác nhận endpoint
- Chi tiết error nếu vẫn lỗi

## Các bước chạy app sau khi rebuild:

1. **Đợi build hoàn tất** (đang chạy...)

2. **Restart Metro nếu cần:**

   ```bash
   npx expo start -c
   ```

3. **Chọn thiết bị:**
   - Press `a` để chạy trên Android
   - Hoặc scan QR code trên điện thoại

4. **Test login:**
   - Dùng số test: `+84 900000001` đến `+84 900000007`
   - Nhập OTP bất kỳ (6 số)
   - Kiểm tra log trong terminal

## Troubleshooting:

### Nếu vẫn lỗi "Network Error":

1. Kiểm tra backend có đang chạy không
2. Kiểm tra port trong `.env`
3. Kiểm tra firewall/antivirus
4. Thử dùng IP máy thật thay vì 10.0.2.2

### Nếu vẫn lỗi Firebase:

1. Xóa app khỏi thiết bị
2. Rebuild lại: `npx expo run:android`
3. Kiểm tra `google-services.json` có trong `android/app/`

### Nếu lỗi "Phiên đăng ký không hợp lệ":

- Kiểm tra log để xem tempToken có được truyền không
- Kiểm tra backend API `/auth/complete-registration` có hoạt động không
- Thử login lại từ đầu

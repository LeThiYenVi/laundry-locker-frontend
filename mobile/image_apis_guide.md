# 📸 Image Upload APIs - Complete Guide

> **API Version**: 1.2  
> **Updated**: 31/01/2026  
> **Feature**: Complete image management for all entities

---

## 📋 Tổng Quan APIs Hình Ảnh

Hệ thống hỗ trợ upload/update hình ảnh cho 4 entities chính:

| Entity | Public API | Admin API | Field Name | Max Length |
|--------|------------|-----------|------------|------------|
| 👤 **User** | ✅ Avatar | ❌ | `imageUrl` | 1000 chars |
| 🏪 **Store** | ❌ | ✅ Admin only | `image` | 1000 chars |
| 🧺 **Service** | ❌ | ✅ Admin only | `image` | 1000 chars |
| 📦 **Locker** | ❌ | ✅ Admin only | `image` | 1000 chars |

---

## 👤 1. User Avatar APIs

### 1.1 Update Avatar (User)

**Endpoint**: `PUT /api/user/avatar`  
**Authentication**: Required (Bearer JWT)  
**Permission**: User own profile only

**Request Body**:
```json
{
  "imageUrl": "https://cdn.example.com/avatars/user123.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Nguyễn",
    "lastName": "Văn A",
    "imageUrl": "https://cdn.example.com/avatars/user123.jpg", // ✨ Updated
    "joinDate": "2024-01-15T10:30:00"
  },
  "message": "Avatar updated successfully"
}
```

**cURL Example**:
```bash
curl -X PUT "http://localhost:8080/api/user/avatar" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://cdn.example.com/avatars/user123.jpg"
  }'
```

### 1.2 Update Profile (Existing API - includes imageUrl)

**Endpoint**: `PUT /api/user/profile`  
Avatar có thể được update qua API profile hiện tại trong field `imageUrl`.

---

## 🏪 2. Store Image APIs (Admin)

### 2.1 Update Store Image

**Endpoint**: `PUT /api/admin/stores/{id}/image`  
**Authentication**: Required (Bearer JWT)  
**Permission**: Admin only

**Request Body**:
```json
{
  "imageUrl": "https://cdn.example.com/stores/store-1.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Laundry Store Q1",
    "address": "123 Nguyễn Huệ, Q1, TP.HCM",
    "image": "https://cdn.example.com/stores/store-1.jpg", // ✨ Updated
    "status": "ACTIVE",
    "lockerCount": 5
  },
  "message": "Store image updated successfully"
}
```

**cURL Example**:
```bash
curl -X PUT "http://localhost:8080/api/admin/stores/1/image" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://cdn.example.com/stores/store-1.jpg"
  }'
```

### 2.2 Create/Update Store (Existing APIs)

Store image cũng có thể được set qua:
- `POST /api/admin/stores` (create) - field `imageUrl`
- `PUT /api/admin/stores/{id}` (update) - field `imageUrl`

---

## 🧺 3. Service Image APIs (Admin)

### 3.1 Update Service Image

**Endpoint**: `PUT /api/admin/services/{id}/image`  
**Authentication**: Required (Bearer JWT)  
**Permission**: Admin only

**Request Body**:
```json
{
  "imageUrl": "https://cdn.example.com/services/wash-dry.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Giặt & Sấy Khô",
    "description": "Dịch vụ giặt và sấy khô chuyên nghiệp",
    "price": 25000,
    "image": "https://cdn.example.com/services/wash-dry.jpg", // ✨ Updated
    "unit": "kg",
    "status": "ACTIVE"
  },
  "message": "Service image updated successfully"
}
```

**cURL Example**:
```bash
curl -X PUT "http://localhost:8080/api/admin/services/1/image" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://cdn.example.com/services/wash-dry.jpg"
  }'
```

### 3.2 Create/Update Service (Existing APIs)

Service image cũng có thể được set qua:
- `POST /api/admin/services` (create) - field `imageUrl`
- `PUT /api/admin/services/{id}` (update) - field `imageUrl`

---

## 📦 4. Locker Image APIs (Admin)

### 4.1 Update Locker Image

**Endpoint**: `PUT /api/admin/lockers/{id}/image`  
**Authentication**: Required (Bearer JWT)  
**Permission**: Admin only

**Request Body**:
```json
{
  "imageUrl": "https://cdn.example.com/lockers/smart-locker-a.jpg"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tủ Thông Minh A",
    "code": "LKR-001",
    "address": "123 Nguyễn Huệ, Q1, TP.HCM",
    "image": "https://cdn.example.com/lockers/smart-locker-a.jpg", // ✨ Updated
    "status": "ACTIVE",
    "storeId": 1,
    "storeName": "Laundry Store Q1",
    "boxCount": 12
  },
  "message": "Locker image updated successfully"
}
```

**cURL Example**:
```bash
curl -X PUT "http://localhost:8080/api/admin/lockers/1/image" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://cdn.example.com/lockers/smart-locker-a.jpg"
  }'
```

### 4.2 Create/Update Locker (Enhanced APIs)

Locker image có thể được set qua:
- `POST /api/admin/lockers` (create) - field `image` ✨ **MỚI**
- `PUT /api/admin/lockers/{id}` (update) - field `image` ✨ **MỚI**

**Enhanced CreateLockerRequest**:
```json
{
  "code": "LKR-002",
  "name": "Tủ Thông Minh B", 
  "address": "456 Lê Lợi, Q1, TP.HCM",
  "image": "https://cdn.example.com/lockers/smart-locker-b.jpg", // ✨ MỚI
  "storeId": 1
}
```

---

## 🛡️ 5. Validation & Security

### 5.1 Request Validation

```json
{
  "imageUrl": {
    "required": true,
    "type": "string",
    "maxLength": 1000,
    "format": "URL",
    "example": "https://cdn.example.com/image.jpg"
  }
}
```

### 5.2 Error Responses

```json
// Validation Error
{
  "success": false,
  "message": "Image URL must be at most 1000 characters",
  "code": "VALIDATION_ERROR"
}

// Access Denied
{
  "success": false, 
  "message": "Access denied. Admin privileges required.",
  "code": "ACCESS_DENIED"
}

// Not Found
{
  "success": false,
  "message": "Store not found: 999",
  "code": "RESOURCE_NOT_FOUND"
}
```

### 5.3 Security Rules

- **User Avatar**: User chỉ có thể update avatar của chính mình
- **Admin Images**: Chỉ Admin mới có thể update Store/Service/Locker images
- **URL Validation**: System chỉ accept valid URLs (không validate file tồn tại)
- **Rate Limiting**: 60 requests/minute cho image updates

---

## 📱 6. Frontend Integration

### 6.1 File Upload Flow

```javascript
// 1. Upload file to your storage (AWS S3, Cloudinary, etc.)
const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/upload', {
    method: 'POST',
    body: formData
  });
  
  const { imageUrl } = await response.json();
  return imageUrl;
};

// 2. Update entity with image URL
const updateUserAvatar = async (file) => {
  // Upload file first
  const imageUrl = await uploadFile(file);
  
  // Update avatar
  const response = await fetch('/api/user/avatar', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageUrl })
  });
  
  return response.json();
};
```

### 6.2 React Component Example

```jsx
const AvatarUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // Upload file to storage
      const imageUrl = await uploadToCloudinary(file);
      
      // Update avatar via API
      const response = await fetch('/api/user/avatar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ imageUrl })
      });

      const result = await response.json();
      if (result.success) {
        setUser(result.data);
        toast.success('Avatar updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to update avatar');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-upload">
      <img 
        src={user?.imageUrl || '/default-avatar.jpg'} 
        alt="Avatar"
        className="avatar-preview"
      />
      <input 
        type="file" 
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />
      {uploading && <div className="spinner">Uploading...</div>}
    </div>
  );
};
```

### 6.3 Image Optimization

```javascript
// Client-side image optimization before upload
const optimizeImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const { width, height } = img;
      const ratio = Math.min(maxWidth / width, maxWidth / height);
      
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
```

---

## 🎨 7. UI/UX Best Practices

### 7.1 Image Placeholders

```javascript
const getImageWithFallback = (imageUrl, type) => {
  const fallbacks = {
    user: '/assets/default-avatar.jpg',
    store: '/assets/default-store.jpg', 
    service: '/assets/default-service.jpg',
    locker: '/assets/default-locker.jpg'
  };
  
  return imageUrl || fallbacks[type];
};
```

### 7.2 Loading States

```jsx
const ImageUpload = ({ onUpload, currentImage, type }) => {
  const [uploading, setUploading] = useState(false);
  
  return (
    <div className="image-upload">
      {uploading ? (
        <div className="upload-placeholder">
          <Spinner />
          <span>Uploading...</span>
        </div>
      ) : (
        <img 
          src={getImageWithFallback(currentImage, type)}
          alt={`${type} image`}
          onError={(e) => {
            e.target.src = getImageWithFallback(null, type);
          }}
        />
      )}
      
      <input 
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
    </div>
  );
};
```

---

## 🧪 8. Testing

### 8.1 Test Scripts

```bash
# Test user avatar update
curl -X PUT "http://localhost:8080/api/user/avatar" \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://picsum.photos/200/200?random=1"}'

# Test store image update (Admin)
curl -X PUT "http://localhost:8080/api/admin/stores/1/image" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://picsum.photos/400/300?random=2"}'

# Test service image update (Admin)  
curl -X PUT "http://localhost:8080/api/admin/services/1/image" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://picsum.photos/300/200?random=3"}'

# Test locker image update (Admin)
curl -X PUT "http://localhost:8080/api/admin/lockers/1/image" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://picsum.photos/500/400?random=4"}'
```

### 8.2 Postman Collection

Các request mới đã được thêm vào Postman collection:
- **User Avatar** → `PUT /api/user/avatar`
- **Admin Store Image** → `PUT /api/admin/stores/{id}/image`  
- **Admin Service Image** → `PUT /api/admin/services/{id}/image`
- **Admin Locker Image** → `PUT /api/admin/lockers/{id}/image`

---

## 📊 9. Summary Table

| API | Method | Endpoint | Auth | Role | Request Field | Response Field |
|-----|--------|----------|------|------|---------------|----------------|
| **User Avatar** | PUT | `/api/user/avatar` | JWT | User | `imageUrl` | `imageUrl` |
| **Store Image** | PUT | `/api/admin/stores/{id}/image` | JWT | Admin | `imageUrl` | `image` |  
| **Service Image** | PUT | `/api/admin/services/{id}/image` | JWT | Admin | `imageUrl` | `image` |
| **Locker Image** | PUT | `/api/admin/lockers/{id}/image` | JWT | Admin | `imageUrl` | `image` |

### Complete Image Management ✅

✅ **User Avatar** - Users can update their own profile pictures  
✅ **Store Images** - Admin can manage store photos for listings  
✅ **Service Images** - Admin can add photos to service catalog  
✅ **Locker Images** - Admin can show locker photos for identification  
✅ **Enhanced Create/Update** - All create/update APIs now support images  
✅ **Validation** - Proper URL validation and length limits  
✅ **Error Handling** - Comprehensive error messages  
✅ **Documentation** - Complete API specification  

---

*All image APIs are now fully implemented and ready for production use! 🎉*
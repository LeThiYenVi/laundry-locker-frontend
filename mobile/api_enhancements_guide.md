# 📋 Tài Liệu Hướng Dẫn - Cập Nhật API Tháng 1/2026

> **Phiên bản**: 1.1  
> **Cập nhật**: 30/01/2026  
> **Tóm tắt**: Bổ sung thông tin profile, trạng thái đơn hàng và API cho người dùng

---

## 📌 Tổng Quan Cập Nhật

Phiên bản này bổ sung 3 nhóm chức năng chính:

1. **Profile API** - Thông tin chi tiết người dùng
2. **Store API** - Hỗ trợ hình ảnh cửa hàng  
3. **Order Status API** - Theo dõi trạng thái đơn hàng

---

## 👤 1. Cập Nhật API Profile Người Dùng

### 1.1 Endpoint Cập Nhật

**URL**: `GET /api/user/profile`  
**Method**: GET  
**Authentication**: Required (Bearer token)

### 1.2 Thông Tin Trả Về Mới

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nguyễn Văn A", // Tên cũ (deprecated)
    "firstName": "Văn A",    // ✨ MỚI
    "lastName": "Nguyễn",    // ✨ MỚI
    "phoneNumber": "+84912345678", // ✨ MỚI
    "imageUrl": "https://example.com/avatar.jpg",
    "provider": "EMAIL",
    "emailVerified": true,
    "phoneVerified": false,  // ✨ MỚI
    "joinDate": "2024-01-15T10:30:00" // ✨ MỚI - Ngày tham gia
  }
}
```

### 1.3 Curl Example

```bash
curl -X GET "http://localhost:8080/api/user/profile" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 1.4 Frontend Integration

```javascript
// React/Vue.js example
const getUserProfile = async () => {
  const response = await fetch('/api/user/profile', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  const { data } = await response.json();
  
  return {
    id: data.id,
    email: data.email,
    fullName: `${data.lastName} ${data.firstName}`, // Tên đầy đủ
    phone: data.phoneNumber,
    avatar: data.imageUrl,
    memberSince: new Date(data.joinDate).toLocaleDateString('vi-VN'),
    isPhoneVerified: data.phoneVerified,
    isEmailVerified: data.emailVerified
  };
};
```

---

## 🏪 2. API Cửa Hàng Với Hình Ảnh

### 2.1 Endpoint

**URL**: `GET /api/stores`  
**Method**: GET  
**Authentication**: None (Public)

### 2.2 Response Với Image

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Laundry Store Q1",
      "contactPhone": "+84901234567",
      "status": "ACTIVE",
      "address": "123 Nguyễn Huệ, Quận 1, TP.HCM",
      "longitude": 106.7008,
      "latitude": 10.7756,
      "image": "https://example.com/store-image.jpg", // ✨ Hình ảnh cửa hàng
      "description": "Cửa hàng giặt ủi hiện đại với công nghệ tiên tiến",
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-30T10:00:00"
    }
  ]
}
```

### 2.3 Curl Examples

```bash
# Lấy tất cả cửa hàng
curl -X GET "http://localhost:8080/api/stores"

# Lấy chi tiết 1 cửa hàng
curl -X GET "http://localhost:8080/api/stores/1"
```

### 2.4 Frontend Display

```javascript
// Component hiển thị danh sách cửa hàng
const StoreCard = ({ store }) => (
  <div className="store-card">
    <img 
      src={store.image || '/default-store.jpg'} 
      alt={store.name}
      className="store-image"
    />
    <div className="store-info">
      <h3>{store.name}</h3>
      <p>{store.address}</p>
      <span className={`status ${store.status.toLowerCase()}`}>
        {store.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm ngừng'}
      </span>
    </div>
  </div>
);
```

---

## 📦 3. API Theo Dõi Trạng Thái Đơn Hàng

### 3.1 Endpoint Mới

**URL**: `GET /api/orders/{orderId}/status`  
**Method**: GET  
**Authentication**: Required (Bearer token)  
**Phân quyền**: Chỉ chủ đơn hàng mới xem được

### 3.2 Response Structure

```json
{
  "success": true,
  "data": {
    "orderId": 101,
    "status": "RETURNED", 
    "statusDescription": "Đồ đã trả vào tủ, sẵn sàng lấy",
    "pinCode": "654321", // Mã PIN để mở tủ
    
    // Thông tin tủ để lấy đồ
    "lockerName": "Tủ thông minh A",
    "lockerCode": "LKR-001", 
    "boxNumber": 5, // Ô số 5
    
    // Thời gian theo dõi
    "createdAt": "2024-01-30T08:00:00",
    "updatedAt": "2024-01-30T16:30:00", 
    "estimatedReadyAt": "2024-01-30T18:00:00",
    "completedAt": null,
    
    // Trạng thái thanh toán
    "isPaid": false,
    
    // Gợi ý hành động tiếp theo
    "nextAction": "Thanh toán để lấy đồ" // ✨ Hướng dẫn user
  }
}
```

### 3.3 Các Trạng Thái Đơn Hàng

| Status | Mô tả | Next Action |
|--------|-------|-------------|
| `INITIALIZED` | Đơn mới tạo | Mang đồ đến tủ, nhập PIN |
| `WAITING` | Đã bỏ đồ, chờ lấy | Chờ nhân viên đến lấy |
| `COLLECTED` | Nhân viên đã lấy | Chờ đồ được xử lý |
| `PROCESSING` | Đang giặt/xử lý | Chờ hoàn thành |
| `READY` | Giặt xong | Chờ trả vào tủ |
| `RETURNED` | Đã trả vào tủ | Thanh toán để lấy đồ |
| `COMPLETED` | Hoàn thành | Đánh giá dịch vụ |
| `CANCELED` | Đã hủy | Tạo đơn mới |

### 3.4 Curl Examples

```bash
# Kiểm tra trạng thái đơn hàng
curl -X GET "http://localhost:8080/api/orders/101/status" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3.5 Error Cases

```json
// Khi user không phải chủ đơn hàng
{
  "success": false,
  "message": "Bạn không phải là chủ sở hữu đơn hàng này",
  "code": "E_ORDER_NOT_OWNER"
}

// Khi không tìm thấy đơn hàng
{
  "success": false,
  "message": "Không tìm thấy đơn hàng",
  "code": "E_ORDER001"
}
```

---

## 🔄 4. Tích Hợp Frontend - Order Tracking

### 4.1 Real-time Status Component

```javascript
const OrderTracker = ({ orderId }) => {
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      
      const result = await response.json();
      if (result.success) {
        setOrderStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch order status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) return <div>Đang tải...</div>;

  return (
    <div className="order-tracker">
      <div className="status-header">
        <h2>Đơn hàng #{orderStatus.orderId}</h2>
        <span className={`status-badge ${orderStatus.status.toLowerCase()}`}>
          {orderStatus.statusDescription}
        </span>
      </div>
      
      <div className="status-timeline">
        <StatusStep 
          status="INITIALIZED" 
          current={orderStatus.status}
          label="Đã tạo đơn" 
        />
        <StatusStep 
          status="WAITING" 
          current={orderStatus.status}
          label="Chờ lấy đồ" 
        />
        <StatusStep 
          status="PROCESSING" 
          current={orderStatus.status}
          label="Đang xử lý" 
        />
        <StatusStep 
          status="RETURNED" 
          current={orderStatus.status}
          label="Sẵn sàng lấy" 
        />
        <StatusStep 
          status="COMPLETED" 
          current={orderStatus.status}
          label="Hoàn thành" 
        />
      </div>

      {/* Action Panel */}
      <div className="action-panel">
        <p className="next-action">{orderStatus.nextAction}</p>
        
        {orderStatus.pinCode && (
          <div className="pin-code">
            <strong>Mã PIN: {orderStatus.pinCode}</strong>
            <p>Tủ: {orderStatus.lockerName} - Ô số {orderStatus.boxNumber}</p>
          </div>
        )}
        
        {!orderStatus.isPaid && orderStatus.status === 'RETURNED' && (
          <button className="pay-button">
            Thanh toán ngay
          </button>
        )}
      </div>
    </div>
  );
};
```

### 4.2 Progress Timeline

```css
.status-timeline {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  position: relative;
}

.status-timeline::before {
  content: '';
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e0e0e0;
  z-index: 1;
}

.status-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.status-step.completed .step-circle {
  background: #4caf50;
  color: white;
}

.status-step.current .step-circle {
  background: #2196f3;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(33, 150, 243, 0); }
  100% { box-shadow: 0 0 0 0 rgba(33, 150, 243, 0); }
}
```

---

## 🛡️ 5. Bảo Mật & Validation

### 5.1 Authentication Required

Tất cả APIs mới đều yêu cầu JWT token:

```bash
# Header bắt buộc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.2 Order Status Security

- User chỉ được xem trạng thái đơn hàng của chính mình
- API sẽ trả lỗi `E_ORDER_NOT_OWNER` nếu user cố xem đơn của người khác

### 5.3 Rate Limiting

Áp dụng rate limit cho API tracking:
- Profile API: 60 requests/phút
- Order Status API: 120 requests/phút (cho phép polling)

---

## 📱 6. Mobile App Integration

### 6.1 Flutter Example

```dart
class OrderStatusService {
  final String baseUrl = 'http://your-api.com';
  
  Future<OrderStatus> getOrderStatus(int orderId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/api/orders/$orderId/status'),
      headers: {
        'Authorization': 'Bearer ${await getStoredToken()}',
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      final json = jsonDecode(response.body);
      return OrderStatus.fromJson(json['data']);
    } else {
      throw Exception('Failed to load order status');
    }
  }
}
```

### 6.2 React Native Example

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderService = {
  async getStatus(orderId) {
    const token = await AsyncStorage.getItem('jwt_token');
    
    const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message);
    }
    
    return result.data;
  }
};
```

---

## ✅ 7. Testing Guide

### 7.1 Unit Tests

```bash
# Test API endpoints
curl -X GET "http://localhost:8080/api/user/profile" \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X GET "http://localhost:8080/api/orders/1/status" \
  -H "Authorization: Bearer YOUR_TOKEN"

curl -X GET "http://localhost:8080/api/stores"
```

### 7.2 Postman Collection

Import collection từ:
`src/main/resources/postman/Laundry_Locker_COMPLETE_API.postman_collection.json`

Các request mới đã được thêm:
- `User Profile Enhanced`
- `Order Status Tracking`
- `Store List with Images`

---

## � Related Documentation

- [API Enhancement Specification](api_enhancements_spec.json) - Technical specifications
- [Quick Start Guide](quickstart_enhancements.md) - Implementation examples
- **[Image Upload APIs Guide](image_apis_guide.md) - Complete image management** ✨ **NEW**
- [Complete API Guide](complete_api_guide.md) - Full API reference
- [Business Flow Guide](end_to_end_business_flow.md) - Business logic flows
- [Testing Guide](api_testing_guide.md) - API testing strategies

---

## 🆕 Latest Updates

### Version 1.2 - Image Management APIs ✨

**New Image Upload Endpoints:**
- `PUT /api/user/avatar` - User avatar updates
- `PUT /api/admin/stores/{id}/image` - Store image management  
- `PUT /api/admin/services/{id}/image` - Service image management
- `PUT /api/admin/lockers/{id}/image` - Locker image management

**Enhanced Features:**
- Complete image validation with 1000 character URL limits
- Unified `UpdateImageRequest` DTO across all endpoints
- Enhanced `CreateLockerRequest` with image field support
- Consistent error handling and security validation

See [Image APIs Guide](image_apis_guide.md) for complete documentation.

---

## 🔧 8. Migration Notes

### 8.1 Database Changes

Không có thay đổi schema database - tất cả fields đã tồn tại:
- User: `phoneNumber`, `firstName`, `lastName`, `createdAt`, `imageUrl`
- Store: `image` 
- LaundryService: `image`
- Locker: `image`
- Order: tất cả fields cần thiết

### 8.2 Backward Compatibility

- API cũ vẫn hoạt động bình thường
- Field `name` trong UserResponse vẫn tồn tại (deprecated)
- Clients cũ không bị ảnh hưởng
- Tất cả image fields là optional

---

## 📞 9. Support & Contact

**API Documentation**: `/swagger-ui.html`  
**Version**: 1.2 ⬆️  
**Support**: dev-team@laundrylocker.com  

**Changelog**:
- ✅ Enhanced user profile with detailed information
- ✅ Order status tracking with real-time updates  
- ✅ Store images support
- ✅ **Complete image management APIs** ✨ **NEW**
- ✅ **User avatar upload functionality** ✨ **NEW**
- ✅ **Admin image management for all entities** ✨ **NEW**
- ✅ Mobile-friendly API responses
- ✅ Comprehensive error handling

---

*Tài liệu này được cập nhật theo phiên bản API mới nhất (v1.2). Vui lòng tham khảo Swagger UI để biết thêm chi tiết.*
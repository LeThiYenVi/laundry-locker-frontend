// Mock Feedback Data

export interface FeedbackItem {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userAvatar: string;
  type: 'BUG' | 'FEATURE' | 'IMPROVEMENT' | 'COMPLAINT' | 'PRAISE';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  subject: string;
  message: string;
  rating?: number; // 1-5 stars
  orderNumber?: string;
  storeId?: number;
  storeName?: string;
  createdAt: string;
  updatedAt: string;
  responseMessage?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export const mockFeedbacks: FeedbackItem[] = [
  {
    id: 1,
    userId: 101,
    userName: "Nguyễn Văn A",
    userEmail: "nguyenvana@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=NguyenVanA",
    type: "BUG",
    status: "NEW",
    priority: "HIGH",
    subject: "Lỗi thanh toán QR Code",
    message: "Khi quét mã QR để thanh toán, ứng dụng bị crash. Tôi đã thử nhiều lần nhưng vẫn không được.",
    rating: 2,
    orderNumber: "ORD-2024-001",
    storeId: 1,
    storeName: "Cửa hàng Quận 1",
    createdAt: "2024-01-24T08:30:00Z",
    updatedAt: "2024-01-24T08:30:00Z",
  },
  {
    id: 2,
    userId: 102,
    userName: "Trần Thị B",
    userEmail: "tranthib@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TranThiB",
    type: "PRAISE",
    status: "CLOSED",
    priority: "LOW",
    subject: "Dịch vụ tuyệt vời!",
    message: "Nhân viên rất nhiệt tình và chuyên nghiệp. Quần áo được giặt sạch sẽ và thơm tho. Sẽ quay lại lần sau!",
    rating: 5,
    orderNumber: "ORD-2024-002",
    storeId: 2,
    storeName: "Cửa hàng Quận 3",
    createdAt: "2024-01-23T14:20:00Z",
    updatedAt: "2024-01-23T16:45:00Z",
    responseMessage: "Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi!",
    respondedBy: "Admin",
    respondedAt: "2024-01-23T16:45:00Z",
  },
  {
    id: 3,
    userId: 103,
    userName: "Lê Văn C",
    userEmail: "levanc@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LeVanC",
    type: "FEATURE",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    subject: "Thêm tính năng đặt lịch trước",
    message: "Mong muốn có tính năng đặt lịch giặt trước vài ngày để không phải chờ đợi.",
    rating: 4,
    storeId: 1,
    storeName: "Cửa hàng Quận 1",
    createdAt: "2024-01-22T10:15:00Z",
    updatedAt: "2024-01-23T09:30:00Z",
    responseMessage: "Chúng tôi đang phát triển tính năng này và sẽ ra mắt trong tháng tới.",
    respondedBy: "Support Team",
    respondedAt: "2024-01-23T09:30:00Z",
  },
  {
    id: 4,
    userId: 104,
    userName: "Phạm Thị D",
    userEmail: "phamthid@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=PhamThiD",
    type: "COMPLAINT",
    status: "RESOLVED",
    priority: "HIGH",
    subject: "Quần áo bị mất",
    message: "Tôi gửi 5 áo nhưng chỉ nhận lại được 4 áo. Áo còn lại đi đâu rồi?",
    rating: 1,
    orderNumber: "ORD-2024-003",
    storeId: 3,
    storeName: "Cửa hàng Quận 5",
    createdAt: "2024-01-21T16:45:00Z",
    updatedAt: "2024-01-22T11:20:00Z",
    responseMessage: "Chúng tôi đã tìm thấy áo của bạn và sẽ giao lại trong hôm nay. Xin lỗi vì sự bất tiện này.",
    respondedBy: "Manager",
    respondedAt: "2024-01-22T11:20:00Z",
  },
  {
    id: 5,
    userId: 105,
    userName: "Hoàng Văn E",
    userEmail: "hoangvane@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=HoangVanE",
    type: "IMPROVEMENT",
    status: "NEW",
    priority: "MEDIUM",
    subject: "Cải thiện UI/UX ứng dụng",
    message: "Giao diện ứng dụng hơi rối. Nên sắp xếp menu rõ ràng hơn và thêm dark mode.",
    rating: 3,
    createdAt: "2024-01-24T07:00:00Z",
    updatedAt: "2024-01-24T07:00:00Z",
  },
  {
    id: 6,
    userId: 106,
    userName: "Đỗ Thị F",
    userEmail: "dothif@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DoThiF",
    type: "BUG",
    status: "IN_PROGRESS",
    priority: "URGENT",
    subject: "Không mở được tủ locker",
    message: "Tôi đã thanh toán nhưng mã PIN không hoạt động. Quần áo vẫn nằm trong tủ và tôi cần lấy gấp.",
    rating: 1,
    orderNumber: "ORD-2024-004",
    storeId: 2,
    storeName: "Cửa hàng Quận 3",
    createdAt: "2024-01-24T09:45:00Z",
    updatedAt: "2024-01-24T10:00:00Z",
    responseMessage: "Kỹ thuật viên đang đến cửa hàng để hỗ trợ bạn. Xin vui lòng đợi 15 phút.",
    respondedBy: "Technical Support",
    respondedAt: "2024-01-24T10:00:00Z",
  },
  {
    id: 7,
    userId: 107,
    userName: "Võ Văn G",
    userEmail: "vovang@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=VoVanG",
    type: "PRAISE",
    status: "CLOSED",
    priority: "LOW",
    subject: "Giá cả hợp lý",
    message: "So với các dịch vụ giặt khác, giá ở đây khá tốt. Chất lượng cũng ổn.",
    rating: 4,
    orderNumber: "ORD-2024-005",
    storeId: 1,
    storeName: "Cửa hàng Quận 1",
    createdAt: "2024-01-20T13:30:00Z",
    updatedAt: "2024-01-20T14:15:00Z",
    responseMessage: "Cảm ơn bạn đã đánh giá cao dịch vụ của chúng tôi!",
    respondedBy: "Admin",
    respondedAt: "2024-01-20T14:15:00Z",
  },
  {
    id: 8,
    userId: 108,
    userName: "Bùi Thị H",
    userEmail: "buithih@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BuiThiH",
    type: "FEATURE",
    status: "NEW",
    priority: "LOW",
    subject: "Thêm loyalty program",
    message: "Nên có chương trình tích điểm hoặc ưu đãi cho khách hàng thân thiết.",
    rating: 4,
    createdAt: "2024-01-24T11:00:00Z",
    updatedAt: "2024-01-24T11:00:00Z",
  },
  {
    id: 9,
    userId: 109,
    userName: "Đinh Văn I",
    userEmail: "dinhvani@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DinhVanI",
    type: "COMPLAINT",
    status: "IN_PROGRESS",
    priority: "HIGH",
    subject: "Quần áo bị phai màu",
    message: "Áo trắng của tôi bị lem màu từ quần áo khác. Đây là lỗi của cửa hàng khi không phân loại đúng cách.",
    rating: 2,
    orderNumber: "ORD-2024-006",
    storeId: 3,
    storeName: "Cửa hàng Quận 5",
    createdAt: "2024-01-23T15:20:00Z",
    updatedAt: "2024-01-24T08:45:00Z",
    responseMessage: "Chúng tôi rất xin lỗi về sự cố này. Vui lòng đến cửa hàng để được bồi thường.",
    respondedBy: "Manager",
    respondedAt: "2024-01-24T08:45:00Z",
  },
  {
    id: 10,
    userId: 110,
    userName: "Mai Thị K",
    userEmail: "maithik@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MaiThiK",
    type: "IMPROVEMENT",
    status: "RESOLVED",
    priority: "MEDIUM",
    subject: "Thời gian giao hàng",
    message: "Nên có dịch vụ giao hàng nhanh trong 3 giờ cho khách hàng gấp.",
    rating: 3,
    createdAt: "2024-01-19T09:30:00Z",
    updatedAt: "2024-01-21T16:00:00Z",
    responseMessage: "Chúng tôi đã thêm dịch vụ Express 3h. Bạn có thể chọn khi đặt hàng!",
    respondedBy: "Product Team",
    respondedAt: "2024-01-21T16:00:00Z",
  },
  {
    id: 11,
    userId: 111,
    userName: "Lý Văn L",
    userEmail: "lyvanl@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=LyVanL",
    type: "PRAISE",
    status: "CLOSED",
    priority: "LOW",
    subject: "App rất tiện lợi",
    message: "Ứng dụng dễ sử dụng, có thông báo đầy đủ. Rất hài lòng!",
    rating: 5,
    orderNumber: "ORD-2024-007",
    storeId: 2,
    storeName: "Cửa hàng Quận 3",
    createdAt: "2024-01-18T10:45:00Z",
    updatedAt: "2024-01-18T11:30:00Z",
    responseMessage: "Cảm ơn feedback tích cực của bạn!",
    respondedBy: "Admin",
    respondedAt: "2024-01-18T11:30:00Z",
  },
  {
    id: 12,
    userId: 112,
    userName: "Cao Thị M",
    userEmail: "caothim@gmail.com",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CaoThiM",
    type: "BUG",
    status: "NEW",
    priority: "MEDIUM",
    subject: "Notification không hoạt động",
    message: "Tôi không nhận được thông báo khi đơn hàng hoàn thành mặc dù đã bật notification.",
    rating: 3,
    createdAt: "2024-01-24T12:15:00Z",
    updatedAt: "2024-01-24T12:15:00Z",
  },
];

// Mock pagination function
export const getPaginatedFeedbacks = (page: number, size: number) => {
  const start = page * size;
  const end = start + size;
  const content = mockFeedbacks.slice(start, end);
  
  return {
    content,
    totalElements: mockFeedbacks.length,
    totalPages: Math.ceil(mockFeedbacks.length / size),
    size,
    number: page,
    first: page === 0,
    last: end >= mockFeedbacks.length,
    empty: content.length === 0,
  };
};

// Helper functions
export const getFeedbackTypeColor = (type: FeedbackItem['type']) => {
  const colors = {
    BUG: 'destructive',
    FEATURE: 'default',
    IMPROVEMENT: 'secondary',
    COMPLAINT: 'destructive',
    PRAISE: 'default',
  };
  return colors[type];
};

export const getFeedbackStatusColor = (status: FeedbackItem['status']) => {
  const colors = {
    NEW: 'default',
    IN_PROGRESS: 'secondary',
    RESOLVED: 'default',
    CLOSED: 'outline',
  };
  return colors[status];
};

export const getFeedbackPriorityColor = (priority: FeedbackItem['priority']) => {
  const colors = {
    LOW: 'outline',
    MEDIUM: 'secondary',
    HIGH: 'default',
    URGENT: 'destructive',
  };
  return colors[priority];
};

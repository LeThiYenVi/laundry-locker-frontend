import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { MessageSquare, Star, AlertCircle } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

// Mock feedback data
const mockFeedbacks = [
  {
    id: 1,
    customerName: "Nguyễn Văn A",
    rating: 5,
    content: "Dịch vụ rất tốt, nhân viên thân thiện!",
    type: "REVIEW",
    status: "NEW",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 2,
    customerName: "Trần Thị B",
    rating: 4,
    content: "Giặt sạch nhưng hơi lâu",
    type: "FEEDBACK",
    status: "READ",
    createdAt: "2024-01-14T15:20:00Z",
  },
  {
    id: 3,
    customerName: "Lê Văn C",
    rating: 2,
    content: "Tủ đồ bị lỗi không mở được",
    type: "COMPLAINT",
    status: "URGENT",
    createdAt: "2024-01-13T09:00:00Z",
  },
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    NEW: "bg-blue-50 text-blue-700 border-blue-200",
    READ: "bg-gray-50 text-gray-700 border-gray-200",
    URGENT: "bg-red-50 text-red-700 border-red-200",
  };
  return <Badge className={`${styles[status]} font-medium`}>{status}</Badge>;
};

const getTypeBadge = (type: string) => {
  const styles: Record<string, string> = {
    REVIEW: "bg-green-50 text-green-700 border-green-200",
    FEEDBACK: "bg-yellow-50 text-yellow-700 border-yellow-200",
    COMPLAINT: "bg-red-50 text-red-700 border-red-200",
  };
  return <Badge className={`${styles[type]} font-medium`}>{type}</Badge>;
};

const renderStars = (rating: number) => {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
};

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý phản hồi"
        description="Quản lý đánh giá và phản hồi từ khách hàng"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <MessageSquare size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="text-sm text-gray-500">Tổng phản hồi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Star size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.2</p>
                <p className="text-sm text-gray-500">Đánh giá TB</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-500">Khiếu nại</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <MessageSquare size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">5</p>
                <p className="text-sm text-gray-500">Chưa đọc</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback List */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockFeedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {feedback.customerName[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {feedback.customerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(feedback.createdAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{feedback.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {renderStars(feedback.rating)}
                      <span className="text-sm text-gray-600">
                        ({feedback.rating}/5)
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(feedback.type)}
                    {getStatusBadge(feedback.status)}
                    <Button variant="ghost" size="sm">
                      Phản hồi
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

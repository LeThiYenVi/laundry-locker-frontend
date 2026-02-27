import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, Button } from "~/components/ui";
import type { DashboardStats } from "../hooks/useDashboard";

interface StatsGridProps {
  stats: DashboardStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Thờii gian xử lý trung bình</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-gray-900">
            {stats.avgProcessingTime}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Từ lúc lấy đồ đến trả khách
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ hoàn thành</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-green-600">
            {stats.completionRate}%
          </div>
          <p className="text-sm text-gray-600 mt-2">Đúng hạn cam kết</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hành động nhanh</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            size="sm"
            className="w-full"
            variant="outline"
            onClick={() => navigate("/partner/orders?status=WAITING")}
          >
            Xem đơn chờ chấp nhận ({stats.pendingCollections})
          </Button>
          <Button
            size="sm"
            className="w-full"
            variant="outline"
            onClick={() => navigate("/partner/orders?status=READY")}
          >
            Đơn sẵn sàng trả
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

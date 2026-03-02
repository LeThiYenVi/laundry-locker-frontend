import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  MessageSquare,
  Star,
  AlertCircle,
  TrendingUp,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import {
  useGetFeedbackAnalyticsQuery,
  useGetReportStatsQuery,
} from "~/stores/apis/admin";
import { FeedbackTab } from "./components/FeedbackTab";
import { ReportsTab } from "./components/ReportsTab";
import { AnalyticsTab } from "./components/AnalyticsTab";

export default function FeedbackPage() {
  const { data: analyticsRes } = useGetFeedbackAnalyticsQuery({
    period: "month",
  });
  const { data: statsRes } = useGetReportStatsQuery();

  const analytics = analyticsRes?.data;
  const stats = statsRes?.data;

  const KPI_CARDS = [
    {
      icon: Star,
      bg: "bg-yellow-50",
      color: "text-yellow-500",
      value: analytics?.averageRating?.toFixed(1) ?? "—",
      label: "Đánh giá trung bình",
    },
    {
      icon: MessageSquare,
      bg: "bg-blue-50",
      color: "text-blue-600",
      value: analytics?.totalFeedback?.toLocaleString("vi-VN") ?? "—",
      label: "Tổng phản hồi",
    },
    {
      icon: AlertCircle,
      bg: "bg-red-50",
      color: "text-red-500",
      value: stats?.openReports?.toLocaleString("vi-VN") ?? "—",
      label: "Báo cáo chờ xử lý",
    },
    {
      icon: TrendingUp,
      bg: "bg-green-50",
      color: "text-green-600",
      value: stats ? `${stats.resolutionRate.toFixed(0)}%` : "—",
      label: "Tỷ lệ giải quyết",
    },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý phản hồi & báo cáo"
        description="Xử lý đánh giá khách hàng, báo cáo sự cố và theo dõi chỉ số hài lòng"
      />

      {/* Hero KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ icon: Icon, bg, color, value, label }) => (
          <Card key={label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
                >
                  <Icon size={20} className={color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="feedback">
        <TabsList className="mb-2">
          <TabsTrigger value="feedback" className="gap-2">
            <Star size={14} />
            Đánh giá khách hàng
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <ClipboardList size={14} />
            Báo cáo sự cố
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 size={14} />
            Phân tích
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feedback">
          <FeedbackTab />
        </TabsContent>
        <TabsContent value="reports">
          <ReportsTab />
        </TabsContent>
        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

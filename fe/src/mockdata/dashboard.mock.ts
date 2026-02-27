import type {
  DashboardOverview,
  ChartDataPoint,
  Recommendation,
  QuickAction,
} from "~/types/dashboard.types";

export const mockDashboardOverview: DashboardOverview = {
  users: {
    count: "12,345",
    change: "12%",
    trend: "up",
  },
  partners: {
    count: "156",
    change: "8%",
    trend: "up",
  },
  stores: {
    count: "89",
    change: "5%",
    trend: "up",
  },
  revenue: {
    count: "2.4B",
    change: "23%",
    trend: "up",
  },
  orders: {
    count: "8,932",
    change: "15%",
    trend: "up",
  },
  bookings: {
    count: "4,521",
    change: "7%",
    trend: "up",
  },
  lockers: {
    count: "324",
    change: "3%",
    trend: "up",
  },
  conversionRate: "68.5%",
};

export const chartData: ChartDataPoint[] = [
  { date: "01/01", value: 150000, orders: 15 },
  { date: "01/05", value: 230000, orders: 23 },
  { date: "01/10", value: 180000, orders: 18 },
  { date: "01/15", value: 320000, orders: 32 },
  { date: "01/20", value: 280000, orders: 28 },
  { date: "01/25", value: 450000, orders: 45 },
  { date: "01/30", value: 380000, orders: 38 },
  { date: "02/05", value: 420000, orders: 42 },
  { date: "02/10", value: 390000, orders: 39 },
  { date: "02/15", value: 510000, orders: 51 },
  { date: "02/20", value: 480000, orders: 48 },
  { date: "02/25", value: 620000, orders: 62 },
];

export const recommendations: Recommendation[] = [
  {
    id: "manage-tenant",
    title: "Quản lý đối tác",
    description: "Xem và quản lý các đối tác trong hệ thống",
  },
  {
    id: "view-analysis",
    title: "Phân tích",
    description: "Xem báo cáo phân tích chi tiết về hệ thống",
  },
  {
    id: "loyalty",
    title: "Khách hàng thân thiết",
    description: "Quản lý chương trình khách hàng thân thiết",
  },
  {
    id: "campaign",
    title: "Chiến dịch",
    description: "Tạo và quản lý các chiến dịch marketing",
  },
  {
    id: "build-model",
    title: "Xây dựng mô hình",
    description: "Tùy chỉnh mô hình kinh doanh",
  },
];

export const quickActions: QuickAction[] = [
  {
    id: "new-order",
    label: "Tạo đơn hàng",
    icon: "Plus",
    href: "/admin/orders",
  },
  {
    id: "new-store",
    label: "Thêm cửa hàng",
    icon: "Store",
    href: "/admin/stores",
  },
  {
    id: "new-partner",
    label: "Thêm đối tác",
    icon: "UserPlus",
    href: "/admin/partners",
  },
  {
    id: "view-reports",
    label: "Xem báo cáo",
    icon: "BarChart3",
    href: "/admin/reports",
  },
];

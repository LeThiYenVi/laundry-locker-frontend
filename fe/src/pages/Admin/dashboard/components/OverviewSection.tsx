import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserCircle,
  Store,
  DollarSign,
  Package,
  CalendarCheck,
  Lock,
} from "lucide-react";
import type { DashboardOverview } from "~/types/dashboard.types";

interface OverviewSectionProps {
  overview: DashboardOverview;
}

function StatItem({
  icon: Icon,
  label,
  value,
  trend,
  trendValue,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="p-2 bg-blue-50 rounded-lg shrink-0">
        <Icon size={20} className="text-blue-600" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {trend && (
            <Badge
              variant={trend === "up" ? "default" : "secondary"}
              className="text-xs"
            >
              {trend === "up" ? (
                <TrendingUp size={12} className="mr-1" />
              ) : (
                <TrendingDown size={12} className="mr-1" />
              )}
              {trendValue}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function OverviewSection({ overview }: OverviewSectionProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900">
          Tổng quan hệ thống
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatItem
            icon={Users}
            label="Ngườii dùng"
            value={overview.users.count}
            trend={overview.users.trend as "up" | "down"}
            trendValue={overview.users.change}
          />
          <StatItem
            icon={UserCircle}
            label="Đối tác"
            value={overview.partners.count}
            trend={overview.partners.trend as "up" | "down"}
            trendValue={overview.partners.change}
          />
          <StatItem
            icon={Store}
            label="Cửa hàng"
            value={overview.stores.count}
            trend={overview.stores.trend as "up" | "down"}
            trendValue={overview.stores.change}
          />
          <StatItem
            icon={DollarSign}
            label="Doanh thu"
            value={overview.revenue.count}
            trend={overview.revenue.trend as "up" | "down"}
            trendValue={overview.revenue.change}
          />
          <StatItem
            icon={Package}
            label="Đơn hàng"
            value={overview.orders.count}
            trend={overview.orders.trend as "up" | "down"}
            trendValue={overview.orders.change}
          />
          <StatItem
            icon={CalendarCheck}
            label="Đặt lịch"
            value={overview.bookings.count}
            trend={overview.bookings.trend as "up" | "down"}
            trendValue={overview.bookings.change}
          />
          <StatItem
            icon={Lock}
            label="Tủ khóa"
            value={overview.lockers.count}
            trend={overview.lockers.trend as "up" | "down"}
            trendValue={overview.lockers.change}
          />
          <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="p-2 bg-green-50 rounded-lg shrink-0">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-gray-500 truncate">Tỷ lệ chuyển đổi</p>
              <p className="text-xl font-bold text-gray-900">
                {overview.conversionRate}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

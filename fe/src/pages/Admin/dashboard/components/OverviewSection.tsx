import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Users,
  Store,
  Lock,
  Wrench,
  Package,
  BoxSelect,
  Clock,
} from "lucide-react";
import type { DashboardOverviewResponse } from "~/types/admin/dashboard";

interface OverviewSectionProps {
  data: DashboardOverviewResponse;
}

function StatRow({
  icon: Icon,
  label,
  value,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor?: string;
  iconBg?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`p-1.5 rounded-lg ${iconBg} shrink-0`}>
        <Icon size={15} className={iconColor} />
      </div>
      <p className="text-sm text-gray-500 flex-1 truncate">{label}</p>
      <p className="text-sm font-bold text-gray-900">
        {typeof value === "number" ? value.toLocaleString("vi-VN") : value}
      </p>
    </div>
  );
}

export function OverviewSection({ data }: OverviewSectionProps) {
  const totalBoxes = data.availableBoxes + data.occupiedBoxes;
  const utilization =
    totalBoxes > 0 ? Math.round((data.occupiedBoxes / totalBoxes) * 100) : 0;

  return (
    <Card className="shadow-sm h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-gray-900">
          Tổng quan hệ thống
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-0.5">
        <StatRow
          icon={Users}
          label="Người dùng"
          value={data.totalUsers}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatRow
          icon={Store}
          label="Cửa hàng"
          value={data.totalStores}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatRow
          icon={Lock}
          label="Locker"
          value={data.totalLockers}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <StatRow
          icon={Wrench}
          label="Dịch vụ hoạt động"
          value={data.activeServices}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        <div className="border-t my-2" />

        <StatRow
          icon={Package}
          label="Box khả dụng"
          value={data.availableBoxes}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatRow
          icon={BoxSelect}
          label="Box đang sử dụng"
          value={data.occupiedBoxes}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />

        {/* Box utilization bar */}
        <div className="flex items-center gap-3 p-2.5">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Tỷ lệ sử dụng box</span>
              <span className="font-bold text-gray-700">{utilization}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${utilization > 80 ? "bg-red-500" : utilization > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${utilization}%` }}
              />
            </div>
          </div>
        </div>

        <div className="border-t my-2" />

        <StatRow
          icon={Clock}
          label="Đơn đang chờ xử lý"
          value={data.pendingOrders}
          iconColor="text-red-600"
          iconBg="bg-red-50"
        />
      </CardContent>
    </Card>
  );
}

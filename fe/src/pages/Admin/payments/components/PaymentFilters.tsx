import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { StatusTabs } from "~/components/shared/status-tabs";
import { PaymentStatus } from "~/types/admin/enums";
import type { PaymentStatusFilter } from "../hooks/usePayments";

interface PaymentFiltersProps {
  status: PaymentStatusFilter;
  onStatusChange: (status: PaymentStatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusCounts: Record<string, number>;
}

const tabs = [
  { value: "ALL", label: "Tất cả", color: "blue" as const },
  { value: PaymentStatus.COMPLETED, label: "Thành công", color: "green" as const },
  { value: PaymentStatus.PENDING, label: "Chờ xử lý", color: "yellow" as const },
  { value: PaymentStatus.PROCESSING, label: "Đang xử lý", color: "purple" as const },
  { value: PaymentStatus.FAILED, label: "Thất bại", color: "red" as const },
];

export function PaymentFilters({
  status,
  onStatusChange,
  searchQuery,
  onSearchChange,
  statusCounts,
}: PaymentFiltersProps) {
  const tabsWithCounts = tabs.map((tab) => ({
    ...tab,
    count: statusCounts[tab.value] || 0,
  }));

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex-1 overflow-x-auto pb-2 lg:pb-0">
          <StatusTabs
            tabs={tabsWithCounts}
            activeTab={status}
            onTabChange={(value) => onStatusChange(value as PaymentStatusFilter)}
          />
        </div>

        <div className="relative w-full lg:w-72 flex-shrink-0">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Tìm kiếm giao dịch..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>
    </div>
  );
}

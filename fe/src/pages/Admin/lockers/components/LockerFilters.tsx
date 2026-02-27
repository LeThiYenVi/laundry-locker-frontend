import { Search } from "lucide-react";
import { Input } from "~/components/ui/input";
import { StatusTabs } from "~/components/shared/status-tabs";
import { LockerStatus } from "~/types/admin/enums";
import type { LockerStatusFilter } from "../hooks/useLockers";

interface LockerFiltersProps {
  status: LockerStatusFilter;
  onStatusChange: (status: LockerStatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusCounts: Record<string, number>;
}

const tabs = [
  { value: "ALL", label: "Tất cả", color: "blue" as const },
  { value: LockerStatus.ACTIVE, label: "Hoạt động", color: "green" as const },
  { value: LockerStatus.MAINTENANCE, label: "Bảo trì", color: "yellow" as const },
  { value: LockerStatus.INACTIVE, label: "Vô hiệu", color: "gray" as const },
  { value: LockerStatus.DISCONNECTED, label: "Mất kết nối", color: "red" as const },
];

export function LockerFilters({
  status,
  onStatusChange,
  searchQuery,
  onSearchChange,
  statusCounts,
}: LockerFiltersProps) {
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
            onTabChange={(value) => onStatusChange(value as LockerStatusFilter)}
          />
        </div>

        <div className="relative w-full lg:w-72 flex-shrink-0">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder="Tìm kiếm tủ đồ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>
    </div>
  );
}

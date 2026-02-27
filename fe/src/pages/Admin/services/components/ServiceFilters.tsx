import { Search, Plus } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { StatusTabs } from "~/components/shared/status-tabs";
import type { ServiceStatus } from "../hooks/useServices";

interface ServiceFiltersProps {
  status: ServiceStatus;
  onStatusChange: (status: ServiceStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusCounts: Record<ServiceStatus, number>;
  onCreate: () => void;
}

const tabs = [
  { value: "ALL", label: "Tất cả", color: "blue" as const },
  { value: "ACTIVE", label: "Hoạt động", color: "green" as const },
  { value: "INACTIVE", label: "Vô hiệu", color: "gray" as const },
];

export function ServiceFilters({
  status,
  onStatusChange,
  searchQuery,
  onSearchChange,
  statusCounts,
  onCreate,
}: ServiceFiltersProps) {
  const tabsWithCounts = tabs.map((tab) => ({
    ...tab,
    count: statusCounts[tab.value as ServiceStatus],
  }));

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <StatusTabs
          tabs={tabsWithCounts}
          activeTab={status}
          onTabChange={(value) => onStatusChange(value as ServiceStatus)}
        />

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Tìm kiếm dịch vụ..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={18} className="mr-2" />
            Thêm dịch vụ
          </Button>
        </div>
      </div>
    </div>
  );
}

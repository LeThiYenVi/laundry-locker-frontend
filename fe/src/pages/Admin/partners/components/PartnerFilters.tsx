import { Search, Plus } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { StatusTabs } from "~/components/shared/status-tabs";
import { PartnerStatus } from "~/types/admin/enums";
import type { PartnerStatusFilter } from "../hooks/usePartners";

interface PartnerFiltersProps {
  status: PartnerStatusFilter;
  onStatusChange: (status: PartnerStatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusCounts: Record<string, number>;
  onCreate: () => void;
}

const tabs = [
  { value: "ALL", label: "Tất cả", color: "blue" as const },
  { value: PartnerStatus.PENDING, label: "Chờ duyệt", color: "yellow" as const },
  { value: PartnerStatus.APPROVED, label: "Đã duyệt", color: "green" as const },
  { value: PartnerStatus.REJECTED, label: "Từ chối", color: "red" as const },
  { value: PartnerStatus.SUSPENDED, label: "Đình chỉ", color: "gray" as const },
];

export function PartnerFilters({
  status,
  onStatusChange,
  searchQuery,
  onSearchChange,
  statusCounts,
  onCreate,
}: PartnerFiltersProps) {
  const tabsWithCounts = tabs.map((tab) => ({
    ...tab,
    count: statusCounts[tab.value] || 0,
  }));

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <StatusTabs
          tabs={tabsWithCounts}
          activeTab={status}
          onTabChange={(value) => onStatusChange(value as PartnerStatusFilter)}
        />

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              placeholder="Tìm kiếm đối tác..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus size={18} className="mr-2" />
            Thêm đối tác
          </Button>
        </div>
      </div>
    </div>
  );
}

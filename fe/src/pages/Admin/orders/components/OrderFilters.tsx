import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "~/components/ui/input";
import { StatusTabs } from "~/components/shared/status-tabs";
import { OrderStatus } from "~/types/admin/enums";

interface OrderFiltersProps {
  status: "ALL" | OrderStatus;
  onStatusChange: (status: "ALL" | OrderStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusCounts: Record<string, number>;
}

export function OrderFilters({
  status,
  onStatusChange,
  searchQuery,
  onSearchChange,
  statusCounts,
}: OrderFiltersProps) {
  const { t } = useTranslation();

  const tabs = [
    { value: "ALL", label: t("common.all"), color: "blue" as const },
    { value: OrderStatus.INITIALIZED, label: t("admin.orders.status.initialized"), color: "gray" as const },
    { value: OrderStatus.PROCESSING, label: t("admin.orders.status.processing"), color: "purple" as const },
    { value: OrderStatus.READY, label: t("admin.orders.status.ready"), color: "blue" as const },
    { value: OrderStatus.COMPLETED, label: t("admin.orders.status.completed"), color: "green" as const },
    { value: OrderStatus.CANCELED, label: t("admin.orders.status.canceled"), color: "red" as const },
  ];

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
          onTabChange={(value) => onStatusChange(value as "ALL" | OrderStatus)}
        />

        <div className="relative w-full sm:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder={t("admin.orders.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>
    </div>
  );
}

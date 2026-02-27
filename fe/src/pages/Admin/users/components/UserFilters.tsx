import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "~/components/ui/input";
import { StatusTabs } from "~/components/shared/status-tabs";
import type { UserStatus } from "../hooks/useUsers";

interface UserFiltersProps {
  status: UserStatus;
  onStatusChange: (status: UserStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusCounts: Record<UserStatus, number>;
}

export function UserFilters({
  status,
  onStatusChange,
  searchQuery,
  onSearchChange,
  statusCounts,
}: UserFiltersProps) {
  const { t } = useTranslation();

  const tabs = [
    { value: "ALL", label: t("common.all"), color: "blue" as const },
    { value: "ACTIVE", label: t("admin.users.status.active"), color: "green" as const },
    { value: "INACTIVE", label: t("admin.users.status.inactive"), color: "red" as const },
    { value: "PENDING", label: t("admin.users.status.pending"), color: "yellow" as const },
  ];

  const tabsWithCounts = tabs.map((tab) => ({
    ...tab,
    count: statusCounts[tab.value as UserStatus],
  }));

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <StatusTabs
          tabs={tabsWithCounts}
          activeTab={status}
          onTabChange={(value) => onStatusChange(value as UserStatus)}
        />

        <div className="relative w-full sm:w-72">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input
            placeholder={t("admin.users.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10"
          />
        </div>
      </div>
    </div>
  );
}

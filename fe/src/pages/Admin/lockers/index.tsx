import { useTranslation } from "react-i18next";
import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { TableToolbar } from "~/components/shared/data-table";
import { LockerTable } from "./components/LockerTable";
import { LockerFilters } from "./components/LockerFilters";
import { LockerStats } from "./components/LockerStats";
import { useLockers } from "./hooks/useLockers";

export default function LockersPage() {
  const { t } = useTranslation();
  const {
    lockers,
    isLoading,
    statistics,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    statusCounts,
    handleViewDetails,
    handleMaintenance,
    handleActivate,
    refetch,
    clearFilters,
    hasActiveFilters,
  } = useLockers();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.lockers.title")}
        description={t("admin.lockers.description")}
      />

      <LockerStats statistics={statistics} />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          {/* Toolbar - 1 hàng */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <LockerFilters
              status={status}
              onStatusChange={setStatus}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusCounts={statusCounts}
            />
            
            <TableToolbar
              onRefresh={refetch}
              onClearFilters={clearFilters}
              canClearFilters={hasActiveFilters}
            />
          </div>

          <LockerTable
            lockers={lockers}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onMaintenance={handleMaintenance}
            onActivate={handleActivate}
          />
        </CardContent>
      </Card>
    </div>
  );
}

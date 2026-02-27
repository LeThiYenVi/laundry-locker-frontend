import { useTranslation } from "react-i18next";
import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
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
          <LockerFilters
            status={status}
            onStatusChange={setStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusCounts={statusCounts}
          />

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

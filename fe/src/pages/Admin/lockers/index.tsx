import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { LockerTable } from "./components/LockerTable";
import { LockerFilters } from "./components/LockerFilters";
import { LockerStats } from "./components/LockerStats";
import { useLockers } from "./hooks/useLockers";

export default function LockersPage() {
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
        title="Quản lý tủ đồ"
        description="Quản lý và giám sát các tủ đồ thông minh trong hệ thống"
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

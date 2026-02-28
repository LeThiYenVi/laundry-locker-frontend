import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { TableToolbar } from "~/components/shared/data-table";
import { PartnerTable } from "./components/PartnerTable";
import { PartnerFilters } from "./components/PartnerFilters";
import { PartnerStats } from "./components/PartnerStats";
import { usePartners } from "./hooks/usePartners";

export default function PartnersPage() {
  const { t } = useTranslation();
  const {
    partners,
    isLoading,
    statistics,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    statusCounts,
    handleCreate,
    handleEdit,
    handleApprove,
    handleReject,
    handleSuspend,
    refetch,
    clearFilters,
    hasActiveFilters,
  } = usePartners();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.partners.title")}
        description={t("admin.partners.description")}
      />

      <PartnerStats statistics={statistics} />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          {/* Toolbar - 1 hàng */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <PartnerFilters
              status={status}
              onStatusChange={setStatus}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusCounts={statusCounts}
            />
            
            <TableToolbar
              createButton={{
                label: t("admin.partners.addPartner"),
                onClick: handleCreate,
                icon: Plus,
              }}
              onRefresh={refetch}
              onClearFilters={clearFilters}
              canClearFilters={hasActiveFilters}
            />
          </div>

          <PartnerTable
            partners={partners}
            isLoading={isLoading}
            onEdit={handleEdit}
            onApprove={handleApprove}
            onReject={handleReject}
            onSuspend={handleSuspend}
          />
        </CardContent>
      </Card>
    </div>
  );
}

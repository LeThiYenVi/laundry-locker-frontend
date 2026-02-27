import { useTranslation } from "react-i18next";
import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
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
          <PartnerFilters
            status={status}
            onStatusChange={setStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusCounts={statusCounts}
            onCreate={handleCreate}
          />

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

import { useTranslation } from "react-i18next";
import { useServices } from "./hooks/useServices";
import { ServiceStats } from "./components/ServiceStats";
import { ServiceList } from "./components/ServiceList";
import { CategoryFilter } from "./components/CategoryFilter";
import { PageLoading, ErrorState, EmptyData } from "~/components/ui";
import { Wrench } from "lucide-react";

export default function PartnerServices() {
  const {
    filteredServices,
    filterCategory,
    setFilterCategory,
    stats,
    isLoading,
    error,
    refetch,
  } = useServices();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            {t("partner.services.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("partner.services.subtitle")}
          </p>
        </div>
      </div>

      {isLoading ? (
        <PageLoading message={t("partner.services.loadingTitle")} />
      ) : error ? (
        <ErrorState
          variant="server"
          title={t("partner.services.errorTitle")}
          error={error}
          onRetry={refetch}
        />
      ) : (
        <>
          <div className="mb-8">
            <ServiceStats stats={stats} />
          </div>
          <div className="mb-6">
            <CategoryFilter
              value={filterCategory}
              onChange={setFilterCategory}
            />
          </div>
          <ServiceList services={filteredServices} />
        </>
      )}
    </div>
  );
}

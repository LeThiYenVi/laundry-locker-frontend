import { PageLoading, ErrorState } from "~/components/ui";
import { useTranslation } from "react-i18next";
import { useStaff } from "./hooks/useStaff";
import { StaffStats } from "./components/StaffStats";
import { StaffList } from "./components/StaffList";

export default function PartnerStaff() {
  const { staff, stats, isLoading, error, refetch } = useStaff();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground">
          {t("partner.staff.title")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("partner.staff.subtitle")}
        </p>
      </div>

      {isLoading ? (
        <PageLoading message={t("partner.staff.loadingTitle")} />
      ) : error ? (
        <ErrorState
          variant="server"
          title={t("partner.staff.errorTitle")}
          error={error}
          onRetry={refetch}
        />
      ) : (
        <>
          <div className="mb-8">
            <StaffStats total={stats.total} active={stats.active} />
          </div>
          <StaffList
            staff={staff}
            onGenerateCode={(s) => console.log("Generate code for", s)}
          />
        </>
      )}
    </div>
  );
}

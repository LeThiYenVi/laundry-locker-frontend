import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { UserTable } from "./components/UserTable";
import { UserFilters } from "./components/UserFilters";
import { useUsers } from "./hooks/useUsers";

export default function UsersPage() {
  const { t } = useTranslation();
  const {
    users,
    isLoading,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    statusCounts,
  } = useUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.users.title")}
        description={t("admin.users.description")}
        action={{
          label: t("admin.users.addUser"),
          onClick: () => console.log("Add user"),
          icon: UserPlus,
        }}
      />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <UserFilters
            status={status}
            onStatusChange={setStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusCounts={statusCounts}
          />

          <UserTable users={users} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}

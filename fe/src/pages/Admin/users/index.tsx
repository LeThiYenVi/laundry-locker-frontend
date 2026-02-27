import { UserPlus } from "lucide-react";
import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { UserTable } from "./components/UserTable";
import { UserFilters } from "./components/UserFilters";
import { useUsers } from "./hooks/useUsers";

export default function UsersPage() {
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
        title="Quản lý ngườii dùng"
        description="Quản lý tài khoản ngườii dùng trong hệ thống"
        action={{
          label: "Thêm ngườii dùng",
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

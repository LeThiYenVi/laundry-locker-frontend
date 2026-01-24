import * as React from "react";
import { Card, CardContent, PageLoading, ErrorState, EmptyData } from "~/components/ui";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui";
import { Badge } from "~/components/ui";
import { t } from "@/lib/i18n";
import { useGetAllLockersQuery } from "@/stores/apis/adminApi";

export default function LockersPage(): React.JSX.Element {
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  const { data: lockersData, isLoading, error } = useGetAllLockersQuery({ pageNumber: page, pageSize: size });
  const lockers = lockersData?.data?.content || [];

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách tủ khóa..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải tủ khóa"
        error={error}
        onRetry={() => window.location.reload()}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{t("admin.lockers.title")}</h1>

      <Card>
        <CardContent>
          {lockers.length === 0 ? (
            <div className="text-muted-foreground">{t("admin.lockers.empty")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.lockers.table.id")}</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>{t("admin.lockers.table.location")}</TableHead>
                  <TableHead>Store</TableHead>
                  <TableHead>{t("admin.lockers.table.status")}</TableHead>
                  <TableHead>Boxes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lockers.map((locker) => (
                  <TableRow key={locker.id}>
                    <TableCell>{locker.id}</TableCell>
                    <TableCell className="font-mono">{locker.code}</TableCell>
                    <TableCell>{locker.name}</TableCell>
                    <TableCell>{locker.address}</TableCell>
                    <TableCell>{locker.storeName}</TableCell>
                    <TableCell>
                      <Badge variant={
                        locker.status === "ACTIVE" ? "default" : 
                        locker.status === "MAINTENANCE" ? "secondary" : 
                        "destructive"
                      }>
                        {locker.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {locker.availableBoxes}/{locker.totalBoxes} available
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

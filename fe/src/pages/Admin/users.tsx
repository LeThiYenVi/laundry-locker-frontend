import * as React from "react";
import { ChartBar, MoreHorizontal, Trash2, Settings, Plus } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  PageLoading,
  ErrorState,
  EmptyData,
} from "~/components/ui";
import { Avatar, Badge, Switch } from "~/components/ui";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "~/components/ui/pagination";
import { t } from "@/lib/i18n";
import { useGetAllUsersQuery } from "@/stores/apis/adminApi";
import type { AdminUserResponse } from "@/types";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
  radius: "rounded-md",
};

export default function UsersPage(): React.JSX.Element {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);

  // Fetch users with API
  const { data: usersData, isLoading, error } = useGetAllUsersQuery({ pageNumber: page, pageSize: size });
  const users = usersData?.data?.content || [];
  const totalPages = usersData?.data?.totalPages || 0;
  const totalElements = usersData?.data?.totalElements || 0;

  const toggleSelect = (id: number) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectAll = (on: boolean) => {
    if (on) {
      const all: Record<string, boolean> = {};
      users.forEach((u) => (all[u.id] = true));
      setSelected(all);
    } else setSelected({});
  };

  // Handle page size change
  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0); // Reset to first page
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách người dùng..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu người dùng"
        error={error}
        onRetry={() => window.location.reload()}
        onClose={() => window.history.back()}
      />
    );
  }

  if (users.length === 0) {
    return (
      <EmptyData
        title="Chưa có người dùng"
        message="Danh sách người dùng đang trống."
        action={{
          label: "Tạo người dùng mới",
          onClick: () => console.log("Create user"),
        }}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">{t('admin.users.header.allUsers')}</div>
            <div className="font-semibold">{totalElements.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <Settings size={16} /> {t('admin.users.table.settings')}
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className={`${tableHeader.bg} border rounded-md flex hover:text-amber-300 px-2 py-1`}>
          <Button variant="default" size="icon" className=" text-amber-100 ">
            <Plus size={16} />
          </Button>
          <Button variant="default" size="sm" className=" text-amber-100 ">
            {t('admin.users.toolbar.add')}
          </Button>
        </div>
        <div className="flex items-center gap-2 border rounded-2xl px-2 py-1">
          <Button variant="ghost">{t('admin.users.toolbar.suspendAll')}</Button>
          <Button variant="ghost">{t('admin.users.toolbar.archiveAll')}</Button>
          <Button variant="ghost" className="text-red-600">{t('admin.users.toolbar.deleteAll')}</Button>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          <Table className="w-full p-0">
            <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
              <TableRow>
                  <TableHead className="rounded-tl-md">
                    <input
                      type="checkbox"
                      checked={Object.keys(selected).length === users.length}
                      onChange={(e) => selectAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead>{t('admin.users.table.columns.user')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.role')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.status')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.social')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.promote')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.rating')}</TableHead>
                  <TableHead>{t('admin.users.table.columns.lastLogin')}</TableHead>
                  <TableHead className="rounded-tr-md">{t('admin.orders.table.action')}</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="h-10">
                  <TableCell className="py-2">
                    <input type="checkbox" checked={!!selected[u.id]} onChange={() => toggleSelect(u.id)} />
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8 text-sm">
                        {u.name?.[0] || u.email[0].toUpperCase()}
                      </Avatar>
                      <div>
                        <div className="font-medium">{u.name || u.email}</div>
                        <div className="text-sm text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="flex gap-1">
                      {u.roles.map((role) => (
                        <Badge key={role} variant={role === "ADMIN" ? "destructive" : role === "STAFF" ? "secondary" : "default"}>
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${u.enabled ? "bg-green-500" : "bg-red-500"}`} />
                      <span>{u.enabled ? "Active" : "Inactive"}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-2">
                    <Badge variant="outline">{u.provider}</Badge>
                  </TableCell>

                  <TableCell className="py-2">
                    <Switch checked={u.emailVerified} disabled />
                  </TableCell>

                  <TableCell className="py-2">
                    <span className="text-xs">ID: {u.id}</span>
                  </TableCell>

                  <TableCell className="py-2">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>

                  <TableCell className="py-2">
                    <button className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer / Pagination */}
          <div className="flex items-center justify-between  border-t border-black-200 pt-4 pl-2 pr-2 pb-2">
            <div className="flex items-center gap-4">
              <select 
                className="border rounded px-2 py-1"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              >
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <div className="text-sm text-muted-foreground">
                {page * size + 1}-{Math.min((page + 1) * size, totalElements)} of {totalElements}
              </div>
            </div>

            <Pagination className="">
              <PaginationContent>
                <PaginationPrevious onClick={() => setPage(Math.max(0, page - 1))} />
                {[...Array(Math.min(5, totalPages))].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      href="#" 
                      isActive={page === i}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(i);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(totalPages - 1);
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationNext onClick={() => setPage(Math.min(totalPages - 1, page + 1))} />
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

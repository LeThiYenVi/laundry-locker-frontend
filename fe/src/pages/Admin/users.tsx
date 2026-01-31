import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Settings, Loader2 } from "lucide-react";
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
  Avatar,
  Badge,
  Switch,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { t } from "@/lib/i18n";
import {
  useGetAllUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateUserStatusMutation,
  useUpdateUserRolesMutation,
  useDeleteUserMutation,
} from "@/stores/apis/admin";
import { ActionMenu, DeleteConfirmDialog } from "@/components/admin";
import type { AdminUserResponse } from "@/types";
import { useToast } from "@/hooks/use-toast";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
  radius: "rounded-md",
};

const userFormSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  firstName: z.string().min(1, "Tên là bắt buộc"),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  roles: z.array(z.string()).min(1, "Chọn ít nhất một vai trò"),
  enabled: z.boolean().default(true),
});

const updateUserFormSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự").optional(),
  email: z.string().email("Email không hợp lệ").optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;
type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;

export default function UsersPage(): React.JSX.Element {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [page, setPage] = React.useState(0);
  const [size, setSize] = React.useState(10);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<AdminUserResponse | null>(null);
  
  const { toast } = useToast();

  const { data: usersData, isLoading, error } = useGetAllUsersQuery({ pageNumber: page, pageSize: size });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [updateUserRoles] = useUpdateUserRolesMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = usersData?.data?.content || [];
  const totalPages = usersData?.data?.totalPages || 0;
  const totalElements = usersData?.data?.totalElements || 0;

  const createForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      roles: ["USER"],
      enabled: true,
    },
  });

  const editForm = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const toggleSelect = (id: number) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectAll = (on: boolean) => {
    if (on) {
      const all: Record<string, boolean> = {};
      users.forEach((u) => (all[u.id] = true));
      setSelected(all);
    } else setSelected({});
  };

  const handleCreate = async (values: UserFormValues) => {
    try {
      await createUser(values).unwrap();
      toast({ title: "Thành công", description: "Đã tạo ngườii dùng mới" });
      setIsCreateOpen(false);
      createForm.reset();
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể tạo ngườii dùng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleEdit = async (values: UpdateUserFormValues) => {
    if (!selectedUser) return;
    try {
      await updateUser({ id: selectedUser.id, data: values }).unwrap();
      toast({ title: "Thành công", description: "Đã cập nhật ngườii dùng" });
      setIsEditOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể cập nhật ngườii dùng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id).unwrap();
      toast({ title: "Thành công", description: "Đã xóa ngườii dùng" });
      setIsDeleteOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể xóa ngườii dùng. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (user: AdminUserResponse) => {
    try {
      await updateUserStatus({ id: user.id, data: { enabled: !user.enabled } }).unwrap();
      toast({ 
        title: "Thành công", 
        description: `Đã ${user.enabled ? "vô hiệu hóa" : "kích hoạt"} ngườii dùng` 
      });
    } catch (error) {
      toast({ 
        title: "Lỗi", 
        description: "Không thể cập nhật trạng thái. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (user: AdminUserResponse) => {
    setSelectedUser(user);
    editForm.reset({
      name: user.name,
      email: user.email,
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (user: AdminUserResponse) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách ngườii dùng..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải dữ liệu ngườii dùng"
        error={error}
        onRetry={() => window.location.reload()}
        onClose={() => window.history.back()}
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
        <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          {t('admin.users.toolbar.add')}
        </Button>
        <div className="flex items-center gap-2 border rounded-2xl px-2 py-1">
          <Button variant="ghost">{t('admin.users.toolbar.suspendAll')}</Button>
          <Button variant="ghost">{t('admin.users.toolbar.archiveAll')}</Button>
          <Button variant="ghost" className="text-red-600">{t('admin.users.toolbar.deleteAll')}</Button>
        </div>
      </div>

      {/* Table */}
      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          {users.length === 0 ? (
            <EmptyData
              title="Chưa có ngườii dùng"
              message="Danh sách ngườii dùng đang trống."
              action={{
                label: "Tạo ngườii dùng mới",
                onClick: () => setIsCreateOpen(true),
              }}
            />
          ) : (
            <>
              <Table className="w-full p-0">
                <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
                  <TableRow>
                      <TableHead className="rounded-tl-md">
                        <input
                          type="checkbox"
                          checked={Object.keys(selected).length === users.length && users.length > 0}
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
                        <ActionMenu
                          onEdit={() => openEditDialog(u)}
                          onDelete={() => openDeleteDialog(u)}
                          onToggleStatus={() => handleToggleStatus(u)}
                          isActive={u.enabled}
                        />
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
                    onChange={(e) => {
                      setSize(Number(e.target.value));
                      setPage(0);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <div className="text-sm text-muted-foreground">
                    {page * size + 1}-{Math.min((page + 1) * size, totalElements)} of {totalElements}
                  </div>
                </div>

                <Pagination className="">
                  <PaginationContent>
                    <PaginationPrevious 
                      onClick={() => setPage(Math.max(0, page - 1))}
                      className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
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
                    <PaginationNext 
                      onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                      className={page >= totalPages - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo ngườii dùng mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo tài khoản ngườii dùng mới.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên</FormLabel>
                      <FormControl>
                        <Input placeholder="Nguyễn" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Họ</FormLabel>
                      <FormControl>
                        <Input placeholder="Văn A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={createForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input placeholder="0901234567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange([value])}
                      defaultValue={field.value[0]}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="STAFF">Staff</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="PARTNER">Partner</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Tạo ngườii dùng
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa ngườii dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin ngườii dùng.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cập nhật
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        itemName={selectedUser?.name || selectedUser?.email}
        isLoading={isDeleting}
      />
    </div>
  );
}

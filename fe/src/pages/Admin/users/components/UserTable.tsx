import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal, Mail, User as UserIcon, Eye, CheckCircle2, Clock } from "lucide-react";
import { DataTable } from "~/components/shared/data-table";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { AdminUserResponse } from "~/types";

interface UserTableProps {
  users: AdminUserResponse[];
  isLoading: boolean;
}

const columnHelper = createColumnHelper<AdminUserResponse>();

const getStatusBadge = (enabled: boolean) => {
  if (enabled) {
    return (
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        <span className="text-sm font-medium text-green-700">Hoạt động</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex rounded-full h-2.5 w-2.5 bg-gray-400"></span>
      <span className="text-sm font-medium text-gray-600">Vô hiệu</span>
    </div>
  );
};

const getRoleBadge = (role: string) => {
  const styles: Record<string, string> = {
    ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
    SUPER_ADMIN: "bg-red-50 text-red-700 border-red-200",
    STAFF: "bg-blue-50 text-blue-700 border-blue-200",
    USER: "bg-gray-50 text-gray-700 border-gray-200",
    PARTNER: "bg-orange-50 text-orange-700 border-orange-200",
    MODERATOR: "bg-teal-50 text-teal-700 border-teal-200",
  };

  return (
    <Badge
      variant="outline"
      className={`${styles[role] || styles.USER} font-medium`}
    >
      {role}
    </Badge>
  );
};

export function UserTable({ users, isLoading }: UserTableProps) {
  const columns = [
    columnHelper.accessor("name", {
      header: "Ngườii dùng",
      cell: ({ row }) => {
        const user = row.original;
        const initials = (user.name || user.email || "U").slice(0, 2).toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-gray-900">
                {user.name || "Chưa đặt tên"}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mail size={12} />
                {user.email}
              </p>
            </div>
          </div>
        );
      },
    }),

    columnHelper.accessor("roles", {
      header: "Vai trò",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          {row.original.roles?.slice(0, 2).map((role) => (
            <span key={role}>{getRoleBadge(role)}</span>
          ))}
          {row.original.roles?.length > 2 && (
            <Badge variant="outline" className="bg-gray-50 text-gray-600">
              +{row.original.roles.length - 2}
            </Badge>
          )}
        </div>
      ),
    }),

    columnHelper.accessor("enabled", {
      header: "Trạng thái",
      cell: ({ row }) => getStatusBadge(row.original.enabled),
    }),

    columnHelper.accessor("provider", {
      header: "Đăng nhập",
      cell: ({ row }) => {
        const provider = row.original.provider;
        const icons: Record<string, string> = {
          EMAIL: "📧",
          GOOGLE: "🔍",
          FACEBOOK: "📘",
          PHONE: "📱",
        };
        return (
          <div className="flex items-center gap-2">
            <span>{icons[provider] || "👤"}</span>
            <span className="text-sm text-gray-600">{provider}</span>
          </div>
        );
      },
    }),

    columnHelper.accessor("emailVerified", {
      header: "Xác thực",
      cell: ({ row }) =>
        row.original.emailVerified ? (
          <Badge className="bg-green-50 text-green-700 border-green-200 font-medium">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Đã xác thực
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-medium">
            <Clock className="mr-1 h-3 w-3" />
            Chờ xác thực
          </Badge>
        ),
    }),

    columnHelper.accessor("createdAt", {
      header: "Ngày tạo",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {new Date(row.original.createdAt).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      ),
    }),

    columnHelper.display({
      id: "actions",
      header: "",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-gray-100"
            >
              <MoreHorizontal size={16} className="text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              ✏️ Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
              🗑️ Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      isLoading={isLoading}
      emptyMessage="Không tìm thấy ngườii dùng nào"
    />
  );
}

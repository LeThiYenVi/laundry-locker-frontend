import { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  Mail,
  User as UserIcon,
  Eye,
  CheckCircle2,
  Clock,
  Smartphone,
  Search,
  Facebook,
  Loader2,
} from "lucide-react";
import { DataTable } from "~/components/shared/data-table";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { useUpdateUserStatusMutation } from "~/stores/apis/admin";
import type { AdminUserResponse } from "~/types";

interface UserTableProps {
  users: AdminUserResponse[];
  isLoading: boolean;
}

const columnHelper = createColumnHelper<AdminUserResponse>();

// Truncated text with tooltip
const TruncatedText = ({
  text,
  maxLength = 20,
  className = "",
}: {
  text: string;
  maxLength?: number;
  className?: string;
}) => {
  if (!text || text.length <= maxLength)
    return <span className={className}>{text || "-"}</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>
            {text.slice(0, maxLength)}...
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Provider icon mapping with Lucide icons only
const ProviderIcon = ({ provider }: { provider: string }) => {
  const iconMap: Record<string, { icon: React.ReactNode; color: string }> = {
    EMAIL: { icon: <Mail size={14} />, color: "text-blue-600 bg-blue-50" },
    GOOGLE: { icon: <Search size={14} />, color: "text-red-500 bg-red-50" },
    FACEBOOK: {
      icon: <Facebook size={14} />,
      color: "text-blue-700 bg-blue-100",
    },
    PHONE: {
      icon: <Smartphone size={14} />,
      color: "text-green-600 bg-green-50",
    },
  };

  const { icon, color } = iconMap[provider] || {
    icon: <UserIcon size={14} />,
    color: "text-gray-600 bg-gray-100",
  };

  return (
    <div
      className={`w-6 h-6 rounded flex items-center justify-center ${color}`}
    >
      {icon}
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
      className={`${styles[role] || styles.USER} font-medium text-xs`}
    >
      {role}
    </Badge>
  );
};

export function UserTable({ users, isLoading }: UserTableProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [updateStatus] = useUpdateUserStatusMutation();
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const handleToggleStatus = async (user: AdminUserResponse) => {
    if (pendingIds.has(user.id)) return;
    setPendingIds((prev) => new Set(prev).add(user.id));
    try {
      await updateStatus({
        id: user.id,
        data: { enabled: !user.enabled },
      }).unwrap();
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(user.id);
        return next;
      });
    }
  };
  const columns = [
    columnHelper.accessor("name", {
      header: t("admin.users.columns.user"),
      cell: ({ row }) => {
        const user = row.original;
        const initials = (user.name || user.email || "U")
          .slice(0, 2)
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white shadow-sm flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <TruncatedText
                text={user.name || t("admin.users.noName")}
                maxLength={20}
                className="font-semibold text-gray-900"
              />
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                <Mail size={14} className="text-gray-400 flex-shrink-0" />
                <span className="truncate max-w-[160px]">{user.email}</span>
              </p>
            </div>
          </div>
        );
      },
    }),

    columnHelper.accessor("roles", {
      header: t("admin.users.columns.role"),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles?.slice(0, 2).map((role) => (
            <span key={role}>{getRoleBadge(role)}</span>
          ))}
          {row.original.roles?.length > 2 && (
            <Badge
              variant="outline"
              className="bg-gray-50 text-gray-600 text-xs"
            >
              +{row.original.roles.length - 2}
            </Badge>
          )}
        </div>
      ),
    }),

    columnHelper.accessor("provider", {
      header: t("admin.users.columns.provider"),
      cell: ({ row }) => {
        const provider = row.original.provider;
        return (
          <div className="flex items-center gap-2">
            <ProviderIcon provider={provider} />
            <span className="text-sm text-gray-600">{provider}</span>
          </div>
        );
      },
    }),

    columnHelper.accessor("emailVerified", {
      header: t("admin.users.columns.verified"),
      cell: ({ row }) =>
        row.original.emailVerified ? (
          <Badge className="bg-green-50 text-green-700 border-green-200 font-medium">
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
            {t("admin.users.verified.yes")}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 font-medium"
          >
            <Clock className="mr-1 h-3.5 w-3.5" />
            {t("admin.users.verified.no")}
          </Badge>
        ),
    }),

    columnHelper.accessor("createdAt", {
      header: t("common.createdAt"),
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

    columnHelper.accessor("enabled", {
      header: t("admin.users.columns.status"),
      cell: ({ row }) => {
        const user = row.original;
        const isPending = pendingIds.has(user.id);
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={user.enabled}
              disabled={isPending}
              onCheckedChange={() => handleToggleStatus(user)}
              className="data-[state=checked]:bg-green-500"
            />
            {isPending ? (
              <Loader2 size={12} className="animate-spin text-gray-400" />
            ) : (
              <span
                className={`text-xs font-medium ${
                  user.enabled ? "text-green-600" : "text-gray-400"
                }`}
              >
                {user.enabled
                  ? t("admin.users.status.active")
                  : t("admin.users.status.inactive")}
              </span>
            )}
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "actions",
      header: t("common.actions"),
      cell: ({ row }) => (
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
          <DropdownMenuContent
            align="end"
            className="w-40 bg-white border border-gray-200"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => navigate(`/admin/users/${row.original.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              {t("dropdown.viewDetail")}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
              <span className="mr-2">🗑️</span> {t("button.delete")}
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
      emptyMessage={t("common.noData")}
    />
  );
}

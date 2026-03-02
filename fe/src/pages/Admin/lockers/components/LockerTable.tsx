import { createColumnHelper } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Box,
  MapPin,
  Store,
  CheckCircle2,
  XCircle,
  Wrench,
  WifiOff,
  Eye,
  Power,
} from "lucide-react";
import { DataTable } from "~/components/shared/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
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
import { LockerStatus } from "~/types/admin/enums";
import type { AdminLockerResponse } from "~/types/admin/locker";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface LockerTableProps {
  lockers: AdminLockerResponse[];
  isLoading: boolean;
  onMaintenance: (lockerId: number) => void;
  onActivate: (lockerId: number) => void;
}

const columnHelper = createColumnHelper<AdminLockerResponse>();

// Unified icon wrapper
const IconWrapper = ({
  children,
  color = "blue",
}: {
  children: React.ReactNode;
  color?: "blue" | "indigo" | "green" | "red" | "amber";
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    amber: "bg-amber-50 text-amber-500",
  };
  return (
    <div
      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}
    >
      {children}
    </div>
  );
};

// Truncated text with tooltip
const TruncatedText = ({
  text,
  maxLength = 25,
  className = "",
}: {
  text: string;
  maxLength?: number;
  className?: string;
}) => {
  if (text.length <= maxLength)
    return <span className={className}>{text}</span>;

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

const getStatusBadge = (status: LockerStatus, t: (key: string) => string) => {
  const variants: Record<
    LockerStatus,
    {
      bg: string;
      text: string;
      border: string;
      icon: React.ElementType;
      label: string;
    }
  > = {
    [LockerStatus.ACTIVE]: {
      bg: "bg-green-50",
      text: "text-green-700",
      border: "border-green-200",
      icon: CheckCircle2,
      label: t("admin.lockers.status.active"),
    },
    [LockerStatus.INACTIVE]: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      border: "border-gray-200",
      icon: XCircle,
      label: t("admin.lockers.status.inactive"),
    },
    [LockerStatus.MAINTENANCE]: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Wrench,
      label: t("admin.lockers.status.maintenance"),
    },
    [LockerStatus.DISCONNECTED]: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: WifiOff,
      label: t("admin.lockers.status.disconnected"),
    },
  };

  const variant = variants[status];
  const Icon = variant.icon;

  return (
    <Badge
      className={`${variant.bg} ${variant.text} ${variant.border} font-medium`}
      variant="outline"
    >
      <Icon className="mr-1 h-3.5 w-3.5" />
      {variant.label}
    </Badge>
  );
};

export function LockerTable({
  lockers,
  isLoading,
  onMaintenance,
  onActivate,
}: LockerTableProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const columns = [
    columnHelper.accessor("code", {
      header: t("admin.lockers.columns.code"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <IconWrapper color="blue">
            <Box size={18} />
          </IconWrapper>
          <div className="min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="font-mono font-semibold text-gray-900 text-sm cursor-help">
                    {row.original.code}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.original.code}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm text-gray-600 font-medium truncate max-w-[150px]">
              {row.original.name}
            </p>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("storeName", {
      header: t("admin.lockers.columns.store"),
      cell: ({ row }) => (
        <div className="flex items-start gap-2">
          <IconWrapper color="indigo">
            <Store size={16} />
          </IconWrapper>
          <div className="min-w-0 pt-0.5">
            <TruncatedText
              text={row.original.storeName}
              maxLength={20}
              className="font-medium text-gray-900"
            />
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
              <MapPin size={14} className="flex-shrink-0 text-gray-400" />
              <TruncatedText
                text={row.original.address}
                maxLength={25}
                className=""
              />
            </div>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("status", {
      header: t("admin.lockers.columns.status"),
      cell: ({ row }) => getStatusBadge(row.original.status, t),
    }),

    columnHelper.accessor("totalBoxes", {
      header: t("admin.lockers.columns.boxes"),
      cell: ({ row }) => {
        const { availableBoxes, totalBoxes } = row.original;
        const occupiedBoxes = totalBoxes - availableBoxes;
        const availablePercent = (availableBoxes / totalBoxes) * 100;

        return (
          <div className="flex flex-col gap-1.5 w-28">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">
                {availableBoxes}/{totalBoxes}
              </span>
              <span
                className={`text-xs font-medium ${
                  availablePercent > 50
                    ? "text-green-600"
                    : availablePercent > 20
                      ? "text-amber-500"
                      : "text-red-500"
                }`}
              >
                trống
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  availablePercent > 50
                    ? "bg-green-500"
                    : availablePercent > 20
                      ? "bg-amber-500"
                      : "bg-red-500"
                }`}
                style={{ width: `${availablePercent}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                {totalBoxes - availableBoxes} đang dùng
              </span>
            </div>
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "actions",
      header: t("common.actions"),
      cell: ({ row }) => {
        const locker = row.original;
        return (
          <div className="flex items-center gap-1">
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
                className="w-48 bg-white border border-gray-200"
              >
                <DropdownMenuItem
                  onClick={() => navigate(`/admin/lockers/${locker.id}`)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                {locker.status === LockerStatus.ACTIVE && (
                  <DropdownMenuItem
                    onClick={() => onMaintenance(locker.id)}
                    className="cursor-pointer text-amber-600 focus:text-amber-600"
                  >
                    <Wrench className="mr-2 h-4 w-4" />
                    Bảo trì
                  </DropdownMenuItem>
                )}
                {(locker.status === LockerStatus.INACTIVE ||
                  locker.status === LockerStatus.MAINTENANCE) && (
                  <DropdownMenuItem
                    onClick={() => onActivate(locker.id)}
                    className="cursor-pointer text-green-600 focus:text-green-600"
                  >
                    <Power className="mr-2 h-4 w-4" />
                    Kích hoạt
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  return (
    <DataTable
      columns={columns}
      data={lockers}
      isLoading={isLoading}
      emptyMessage={t("common.noData")}
    />
  );
}

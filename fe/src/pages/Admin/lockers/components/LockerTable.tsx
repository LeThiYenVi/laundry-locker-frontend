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
  ChevronRight,
} from "lucide-react";
import { DataTable } from "~/components/shared/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { LockerStatus } from "~/types/admin/enums";
import type { MockLocker } from "~/mockdata/lockers.mock";
import { useNavigate } from "react-router-dom";

interface LockerTableProps {
  lockers: MockLocker[];
  isLoading: boolean;
  onViewDetails: (locker: MockLocker) => void;
  onMaintenance: (lockerId: number) => void;
  onActivate: (lockerId: number) => void;
}

const columnHelper = createColumnHelper<MockLocker>();

const getStatusBadge = (status: LockerStatus) => {
  const variants: Record<
    LockerStatus,
    { bg: string; text: string; icon: React.ElementType; label: string }
  > = {
    [LockerStatus.ACTIVE]: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: CheckCircle2,
      label: "Hoạt động",
    },
    [LockerStatus.INACTIVE]: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      icon: XCircle,
      label: "Vô hiệu",
    },
    [LockerStatus.MAINTENANCE]: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      icon: Wrench,
      label: "Bảo trì",
    },
    [LockerStatus.DISCONNECTED]: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: WifiOff,
      label: "Mất kết nối",
    },
  };

  const variant = variants[status];
  const Icon = variant.icon;

  return (
    <Badge className={`${variant.bg} ${variant.text} border-0 font-medium`}>
      <Icon className="mr-1 h-3 w-3" />
      {variant.label}
    </Badge>
  );
};

export function LockerTable({
  lockers,
  isLoading,
  onViewDetails,
  onMaintenance,
  onActivate,
}: LockerTableProps) {
  const navigate = useNavigate();
  const columns = [
    columnHelper.accessor("code", {
      header: "Mã tủ",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center shadow-sm">
            <Box size={24} className="text-blue-600" />
          </div>
          <div>
            <p className="font-mono font-semibold text-gray-900 text-sm">
              {row.original.code}
            </p>
            <p className="text-sm text-gray-600 font-medium">
              {row.original.name}
            </p>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("storeName", {
      header: "Cửa hàng",
      cell: ({ row }) => (
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <Store size={16} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {row.original.storeName}
            </p>
            <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
              <MapPin size={12} />
              <span className="line-clamp-1 max-w-[200px]">
                {row.original.address}
              </span>
            </div>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: ({ row }) => getStatusBadge(row.original.status),
    }),

    columnHelper.accessor("totalBoxes", {
      header: "Ngăn tủ",
      cell: ({ row }) => {
        const { availableBoxes, totalBoxes, occupiedBoxes } = row.original;
        const availablePercent = (availableBoxes / totalBoxes) * 100;

        return (
          <div className="flex flex-col gap-2 w-36">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">
                {availableBoxes}/{totalBoxes}
              </span>
              <span
                className={`text-xs font-medium ${
                  availablePercent > 50
                    ? "text-green-600"
                    : availablePercent > 20
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                trống
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  availablePercent > 50
                    ? "bg-green-500"
                    : availablePercent > 20
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${availablePercent}%` }}
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                {occupiedBoxes} đang dùng
              </span>
            </div>
          </div>
        );
      },
    }),

    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const locker = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => navigate(`/admin/lockers/${locker.id}`)}
            >
              Chi tiết
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>

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
              <DropdownMenuContent align="end" className="w-48">
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
                    className="cursor-pointer text-yellow-600 focus:text-yellow-600"
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
      emptyMessage="Không tìm thấy tủ đồ nào"
    />
  );
}

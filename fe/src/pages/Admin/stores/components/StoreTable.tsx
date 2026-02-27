import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal, MapPin, Phone, Clock, Store as StoreIcon, CheckCircle2, XCircle } from "lucide-react";
import { DataTable } from "~/components/shared/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { MockStore } from "~/mockdata/stores.mock";

interface StoreTableProps {
  stores: MockStore[];
  isLoading: boolean;
  onEdit: (store: MockStore) => void;
  onDelete: (storeId: number) => void;
}

const columnHelper = createColumnHelper<MockStore>();

export function StoreTable({ stores, isLoading, onEdit, onDelete }: StoreTableProps) {
  const columns = [
    columnHelper.accessor("name", {
      header: "Cửa hàng",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center shadow-sm">
            <StoreIcon size={24} className="text-indigo-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.original.name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs">👤</span>
              {row.original.managerName}
            </p>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("phone", {
      header: "Liên hệ",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-6 h-6 rounded-lg bg-green-50 flex items-center justify-center">
              <Phone size={12} className="text-green-600" />
            </div>
            <span className="font-medium">{row.original.phone}</span>
          </div>
          <span className="text-xs text-gray-400 ml-8">{row.original.email}</span>
        </div>
      ),
    }),

    columnHelper.accessor("address", {
      header: "Địa chỉ",
      cell: ({ row }) => (
        <div className="flex items-start gap-2 text-gray-600 max-w-xs">
          <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MapPin size={12} className="text-red-500" />
          </div>
          <span className="text-sm line-clamp-2">{row.original.address}</span>
        </div>
      ),
    }),

    columnHelper.accessor("openingHours", {
      header: "Giờ mở cửa",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <Clock size={16} className="text-amber-500" />
          </div>
          <span className="font-medium text-gray-700">{row.original.openingHours}</span>
        </div>
      ),
    }),

    columnHelper.accessor("totalLockers", {
      header: "Tủ đồ",
      cell: ({ row }) => {
        const percent = (row.original.availableLockers / row.original.totalLockers) * 100;
        return (
          <div className="flex flex-col gap-2 w-32">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                {row.original.availableLockers}/{row.original.totalLockers}
              </span>
              <span className={`text-xs font-medium ${percent < 30 ? 'text-red-500' : percent < 70 ? 'text-yellow-500' : 'text-green-500'}`}>
                {Math.round(percent)}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percent < 30 ? 'bg-red-500' : percent < 70 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    }),

    columnHelper.accessor("isActive", {
      header: "Trạng thái",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.isActive
              ? "bg-green-50 text-green-700 border-green-200 font-medium"
              : "bg-gray-100 text-gray-600 border-gray-200 font-medium"
          }
          variant="outline"
        >
          {row.original.isActive ? (
            <>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Hoạt động
            </>
          ) : (
            <>
              <XCircle className="mr-1 h-3 w-3" />
              Vô hiệu
            </>
          )}
        </Badge>
      ),
    }),

    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
              <MoreHorizontal size={16} className="text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onEdit(row.original)} className="cursor-pointer">
              ✏️ Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original.id)}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
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
      data={stores}
      isLoading={isLoading}
      emptyMessage="Không tìm thấy cửa hàng nào"
    />
  );
}

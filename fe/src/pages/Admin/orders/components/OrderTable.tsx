import { createColumnHelper } from "@tanstack/react-table";
import {
  MoreHorizontal,
  Package,
  Eye,
  Edit3,
  Ban,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  Box,
  XCircle,
  AlertCircle,
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
import { OrderStatus } from "~/types/admin/enums";
import type { Order } from "~/types/orders";
import { useNavigate } from "react-router-dom";

interface OrderTableProps {
  orders: Order[];
  isLoading: boolean;
}

const columnHelper = createColumnHelper<Order>();

const getStatusBadge = (status: OrderStatus) => {
  const variants: Record<
    OrderStatus,
    { bg: string; text: string; label: string; icon: React.ElementType }
  > = {
    [OrderStatus.INITIALIZED]: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      label: "Khởi tạo",
      icon: Clock,
    },
    [OrderStatus.RESERVED]: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      label: "Đã đặt",
      icon: CheckCircle2,
    },
    [OrderStatus.WAITING]: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      label: "Chờ thu gom",
      icon: Truck,
    },
    [OrderStatus.COLLECTED]: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      label: "Đã thu gom",
      icon: CheckCircle2,
    },
    [OrderStatus.PROCESSING]: {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      label: "Đang xử lý",
      icon: RotateCcw,
    },
    [OrderStatus.READY]: {
      bg: "bg-teal-50",
      text: "text-teal-700",
      label: "Sẵn sàng",
      icon: CheckCircle2,
    },
    [OrderStatus.RETURNED]: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      label: "Đã trả",
      icon: Box,
    },
    [OrderStatus.COMPLETED]: {
      bg: "bg-green-50",
      text: "text-green-700",
      label: "Hoàn thành",
      icon: CheckCircle2,
    },
    [OrderStatus.CANCELED]: {
      bg: "bg-red-50",
      text: "text-red-700",
      label: "Đã hủy",
      icon: XCircle,
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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export function OrderTable({ orders, isLoading }: OrderTableProps) {
  const navigate = useNavigate();

  const columns = [
    columnHelper.accessor("id", {
      header: "Mã đơn",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-sm">
            <Package size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.original.id}</p>
            <p className="text-xs text-gray-500">
              {row.original.items?.length || 0} sản phẩm
            </p>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("customerName", {
      header: "Khách hàng",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.original.customerName || "N/A"}
          </p>
          <p className="text-xs text-gray-500">ID: {row.original.customerId}</p>
        </div>
      ),
    }),

    columnHelper.accessor("items", {
      header: "Dịch vụ",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.original.items?.slice(0, 2).map((item) => (
            <Badge
              key={item.id}
              variant="outline"
              className="bg-gray-50 text-gray-700 font-normal w-fit"
            >
              {item.name} × {item.qty}
            </Badge>
          ))}
          {row.original.items && row.original.items.length > 2 && (
            <span className="text-xs text-gray-500">
              +{row.original.items.length - 2} sản phẩm khác
            </span>
          )}
        </div>
      ),
    }),

    columnHelper.accessor("total", {
      header: "Tổng tiền",
      cell: ({ row }) => (
        <span className="font-semibold text-blue-600">
          {row.original.total ? formatCurrency(row.original.total) : "N/A"}
        </span>
      ),
    }),

    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: ({ row }) => getStatusBadge(row.original.status),
    }),

    columnHelper.accessor("createdAt", {
      header: "Ngày tạo",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A"}
        </span>
      ),
    }),

    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const order = row.original;
        const canCancel = ([OrderStatus.INITIALIZED, OrderStatus.WAITING] as OrderStatus[]).includes(
          order.status
        );

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => navigate(`/admin/orders/${order.id}`)}
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
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Edit3 className="mr-2 h-4 w-4" />
                  Cập nhật trạng thái
                </DropdownMenuItem>
                {canCancel && (
                  <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                    <Ban className="mr-2 h-4 w-4" />
                    Hủy đơn
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
      data={orders}
      isLoading={isLoading}
      emptyMessage="Không tìm thấy đơn hàng nào"
    />
  );
}

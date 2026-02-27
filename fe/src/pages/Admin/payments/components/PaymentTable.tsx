import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal, CreditCard, Wallet, Banknote, Smartphone, RefreshCcw, CheckCircle2, Clock, RotateCcw, XCircle, Undo2, Ban, Eye } from "lucide-react";
import { DataTable } from "~/components/shared/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { PaymentStatus, PaymentMethod } from "~/types/admin/enums";
import type { MockPayment } from "~/mockdata/payments.mock";

interface PaymentTableProps {
  payments: MockPayment[];
  isLoading: boolean;
}

const columnHelper = createColumnHelper<MockPayment>();

const getStatusBadge = (status: PaymentStatus) => {
  const variants: Record<PaymentStatus, { bg: string; text: string; icon: React.ElementType; label: string }> = {
    [PaymentStatus.COMPLETED]: {
      bg: "bg-green-50",
      text: "text-green-700",
      icon: CheckCircle2,
      label: "Thành công",
    },
    [PaymentStatus.PENDING]: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      icon: Clock,
      label: "Chờ thanh toán",
    },
    [PaymentStatus.PROCESSING]: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: RotateCcw,
      label: "Đang xử lý",
    },
    [PaymentStatus.FAILED]: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: XCircle,
      label: "Thất bại",
    },
    [PaymentStatus.REFUNDED]: {
      bg: "bg-gray-50",
      text: "text-gray-700",
      icon: Undo2,
      label: "Đã hoàn tiền",
    },
    [PaymentStatus.CANCELED]: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      icon: Ban,
      label: "Đã hủy",
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

const getMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.MOMO:
    case PaymentMethod.ZALOPAY:
      return <Smartphone size={18} className="text-pink-500" />;
    case PaymentMethod.VNPAY:
      return <CreditCard size={18} className="text-blue-500" />;
    case PaymentMethod.BANK_TRANSFER:
      return <Banknote size={18} className="text-green-500" />;
    case PaymentMethod.WALLET:
      return <Wallet size={18} className="text-purple-500" />;
    default:
      return <Banknote size={18} className="text-gray-500" />;
  }
};

const getMethodLabel = (method: PaymentMethod) => {
  const labels: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: "Tiền mặt",
    [PaymentMethod.WALLET]: "Ví điện tử",
    [PaymentMethod.BANK_TRANSFER]: "Chuyển khoản",
    [PaymentMethod.MOMO]: "MoMo",
    [PaymentMethod.VNPAY]: "VNPay",
    [PaymentMethod.ZALOPAY]: "ZaloPay",
  };
  return labels[method] || method;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export function PaymentTable({ payments, isLoading }: PaymentTableProps) {
  const columns = [
    columnHelper.accessor("id", {
      header: "Mã thanh toán",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center shadow-sm">
            <CreditCard size={20} className="text-green-600" />
          </div>
          <div>
            <p className="font-mono font-semibold text-gray-900 text-sm">{row.original.id}</p>
            <p className="text-xs text-gray-500">{row.original.orderCode}</p>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("customerName", {
      header: "Khách hàng",
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.customerName}</span>
      ),
    }),

    columnHelper.accessor("amount", {
      header: "Số tiền",
      cell: ({ row }) => (
        <span className="text-lg font-bold text-green-600">
          {formatCurrency(row.original.amount)}
        </span>
      ),
    }),

    columnHelper.accessor("method", {
      header: "Phương thức",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getMethodIcon(row.original.method)}
          <Badge variant="outline" className="bg-gray-50 font-medium">
            {getMethodLabel(row.original.method)}
          </Badge>
        </div>
      ),
    }),

    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: ({ row }) => getStatusBadge(row.original.status),
    }),

    columnHelper.accessor("paidAt", {
      header: "Thờii gian",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.paidAt
            ? new Date(row.original.paidAt).toLocaleString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </span>
      ),
    }),

    columnHelper.display({
      id: "actions",
      header: "",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
              <MoreHorizontal size={16} className="text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              📄 Xem hóa đơn
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-orange-600 focus:text-orange-600">
              <RefreshCcw size={14} className="mr-2" />
              Hoàn tiền
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ];

  return (
    <DataTable
      columns={columns}
      data={payments}
      isLoading={isLoading}
      emptyMessage="Không tìm thấy giao dịch nào"
    />
  );
}

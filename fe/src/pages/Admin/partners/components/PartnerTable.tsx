import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal, Building2, Phone, User, CheckCircle, XCircle, AlertCircle, Clock, Eye } from "lucide-react";
import { DataTable } from "~/components/shared/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { PartnerStatus } from "~/types/admin/enums";
import type { MockPartner } from "~/mockdata/partners.mock";

interface PartnerTableProps {
  partners: MockPartner[];
  isLoading: boolean;
  onEdit: (partner: MockPartner) => void;
  onApprove: (partnerId: number) => void;
  onReject: (partnerId: number) => void;
  onSuspend: (partnerId: number) => void;
}

const columnHelper = createColumnHelper<MockPartner>();

const getStatusBadge = (status: PartnerStatus) => {
  const variants: Record<PartnerStatus, { className: string; icon: React.ReactNode; label: string }> = {
    [PartnerStatus.APPROVED]: {
      className: "bg-green-50 text-green-700 border-green-200",
      icon: <CheckCircle size={14} className="text-green-600" />,
      label: "Đã duyệt",
    },
    [PartnerStatus.PENDING]: {
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      icon: <Clock size={14} className="text-yellow-600" />,
      label: "Chờ duyệt",
    },
    [PartnerStatus.REJECTED]: {
      className: "bg-red-50 text-red-700 border-red-200",
      icon: <XCircle size={14} className="text-red-600" />,
      label: "Từ chối",
    },
    [PartnerStatus.SUSPENDED]: {
      className: "bg-gray-50 text-gray-700 border-gray-200",
      icon: <AlertCircle size={14} className="text-gray-600" />,
      label: "Đình chỉ",
    },
  };

  const variant = variants[status];
  return (
    <Badge className={`${variant.className} font-medium`} variant="outline">
      <span className="mr-1.5">{variant.icon}</span>
      {variant.label}
    </Badge>
  );
};

export function PartnerTable({
  partners,
  isLoading,
  onEdit,
  onApprove,
  onReject,
  onSuspend,
}: PartnerTableProps) {
  const columns = [
    columnHelper.accessor("name", {
      header: "Đối tác",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center shadow-sm">
            <Building2 size={24} className="text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{row.original.name}</p>
            <p className="text-sm text-gray-500">{row.original.email}</p>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("representativeName", {
      header: "Ngườii đại diện",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
              <User size={12} className="text-blue-600" />
            </div>
            <span className="font-medium">{row.original.representativeName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
              <Phone size={12} className="text-green-600" />
            </div>
            <span>{row.original.representativePhone}</span>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("businessLicense", {
      header: "Mã số thuế",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm bg-gray-50 px-3 py-1.5 rounded-lg text-gray-700 border border-gray-200">
            {row.original.businessLicense}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor("totalStores", {
      header: "Cửa hàng",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
            <Building2 size={16} className="text-indigo-600" />
          </div>
          <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold">
            {row.original.totalStores} cửa hàng
          </Badge>
        </div>
      ),
    }),

    columnHelper.accessor("status", {
      header: "Trạng thái",
      cell: ({ row }) => getStatusBadge(row.original.status),
    }),

    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const partner = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
                <MoreHorizontal size={16} className="text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(partner)} className="cursor-pointer">
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              {partner.status === PartnerStatus.PENDING && (
                <>
                  <DropdownMenuItem
                    onClick={() => onApprove(partner.id)}
                    className="cursor-pointer text-green-600 focus:text-green-600"
                  >
                    <CheckCircle size={14} className="mr-2" />
                    Phê duyệt
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onReject(partner.id)}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <XCircle size={14} className="mr-2" />
                    Từ chối
                  </DropdownMenuItem>
                </>
              )}
              {partner.status === PartnerStatus.APPROVED && (
                <DropdownMenuItem
                  onClick={() => onSuspend(partner.id)}
                  className="cursor-pointer text-orange-600 focus:text-orange-600"
                >
                  <AlertCircle size={14} className="mr-2" />
                  Đình chỉ
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }),
  ];

  return (
    <DataTable
      columns={columns}
      data={partners}
      isLoading={isLoading}
      emptyMessage="Không tìm thấy đối tác nào"
    />
  );
}

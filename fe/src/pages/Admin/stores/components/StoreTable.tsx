import { createColumnHelper } from "@tanstack/react-table";
import { MoreHorizontal, MapPin, Phone, Clock, Store as StoreIcon, CheckCircle2, XCircle, User } from "lucide-react";
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
import { useTranslation } from "react-i18next";
import type { MockStore } from "~/mockdata/stores.mock";

interface StoreTableProps {
  stores: MockStore[];
  isLoading: boolean;
  onEdit: (store: MockStore) => void;
  onDelete: (storeId: number) => void;
}

const columnHelper = createColumnHelper<MockStore>();

// Unified icon wrapper
const IconWrapper = ({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "green" | "red" | "amber" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
    amber: "bg-amber-50 text-amber-500",
  };
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[color]}`}>
      {children}
    </div>
  );
};

// Truncated text with tooltip
const TruncatedText = ({ text, maxLength = 30, className = "" }: { text: string; maxLength?: number; className?: string }) => {
  if (text.length <= maxLength) return <span className={className}>{text}</span>;
  
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

export function StoreTable({ stores, isLoading, onEdit, onDelete }: StoreTableProps) {
  const { t } = useTranslation();
  const columns = [
    columnHelper.accessor("name", {
      header: t("admin.stores.columns.store"),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <IconWrapper color="blue">
            <StoreIcon size={18} />
          </IconWrapper>
          <div className="min-w-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="font-semibold text-gray-900 truncate max-w-[180px] cursor-help">
                    {row.original.name}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.original.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
              <User size={14} className="text-gray-400 flex-shrink-0" />
              <span className="truncate max-w-[150px]">{row.original.managerName}</span>
            </p>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("phone", {
      header: t("admin.stores.columns.contact"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <IconWrapper color="green">
            <Phone size={16} />
          </IconWrapper>
          <div className="min-w-0">
            <p className="font-medium text-gray-700">{row.original.phone}</p>
            <p className="text-xs text-gray-400 truncate max-w-[140px]">{row.original.email}</p>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("address", {
      header: t("admin.stores.columns.address"),
      cell: ({ row }) => (
        <div className="flex items-start gap-2">
          <IconWrapper color="red">
            <MapPin size={16} />
          </IconWrapper>
          <div className="min-w-0 pt-1">
            <TruncatedText 
              text={row.original.address} 
              maxLength={35}
              className="text-sm text-gray-600"
            />
          </div>
        </div>
      ),
    }),

    columnHelper.accessor("openingHours", {
      header: t("admin.stores.columns.hours"),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <IconWrapper color="amber">
            <Clock size={16} />
          </IconWrapper>
          <span className="font-medium text-gray-700">{row.original.openingHours}</span>
        </div>
      ),
    }),

    columnHelper.accessor("totalLockers", {
      header: t("admin.stores.columns.lockers"),
      cell: ({ row }) => {
        const percent = (row.original.availableLockers / row.original.totalLockers) * 100;
        return (
          <div className="flex flex-col gap-1.5 w-28">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                {row.original.availableLockers}/{row.original.totalLockers}
              </span>
              <span className={`text-xs font-medium ${percent < 30 ? 'text-red-500' : percent < 70 ? 'text-amber-500' : 'text-green-500'}`}>
                {Math.round(percent)}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percent < 30 ? 'bg-red-500' : percent < 70 ? 'bg-amber-500' : 'bg-green-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      },
    }),

    columnHelper.accessor("isActive", {
      header: t("admin.stores.columns.status"),
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
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              {t("admin.stores.status.active")}
            </>
          ) : (
            <>
              <XCircle className="mr-1 h-3.5 w-3.5" />
              {t("admin.stores.status.inactive")}
            </>
          )}
        </Badge>
      ),
    }),

    columnHelper.display({
      id: "actions",
      header: t("common.actions"),
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100">
              <MoreHorizontal size={16} className="text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-white border border-gray-200">
            <DropdownMenuItem onClick={() => onEdit(row.original)} className="cursor-pointer">
              <span className="mr-2">✏️</span> {t("dropdown.edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(row.original.id)}
              className="cursor-pointer text-red-600 focus:text-red-600"
            >
              <span className="mr-2">🗑️</span> {t("dropdown.delete")}
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
      emptyMessage={t("common.noData")}
    />
  );
}

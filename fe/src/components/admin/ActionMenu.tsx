import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Pencil, Trash2, Power, PowerOff } from "lucide-react";

interface ActionMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleStatus?: () => void;
  isActive?: boolean;
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
  }>;
}

export function ActionMenu({
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  isActive,
  customActions,
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            Xem chi tiết
          </DropdownMenuItem>
        )}
        
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
        )}

        {onToggleStatus && (
          <DropdownMenuItem onClick={onToggleStatus}>
            {isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4 text-amber-500" />
                <span className="text-amber-600">Vô hiệu hóa</span>
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4 text-green-500" />
                <span className="text-green-600">Kích hoạt</span>
              </>
            )}
          </DropdownMenuItem>
        )}

        {customActions && customActions.length > 0 && (
          <>
            {(onView || onEdit || onToggleStatus) && <DropdownMenuSeparator />}
            {customActions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                onClick={action.onClick}
                className={action.variant === "destructive" ? "text-red-600" : ""}
              >
                {action.icon && <span className="mr-2">{action.icon}</span>}
                {action.label}
              </DropdownMenuItem>
            ))}
          </>
        )}

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

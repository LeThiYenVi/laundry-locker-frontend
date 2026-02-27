import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "~/lib/utils";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Auto-generate breadcrumb from path
const pathMap: Record<string, string> = {
  admin: "Admin",
  dashboard: "Dashboard",
  users: "Ngườii dùng",
  orders: "Đơn hàng",
  stores: "Cửa hàng",
  lockers: "Tủ đồ",
  services: "Dịch vụ",
  payments: "Thanh toán",
  loyalty: "Khách hàng thân thiết",
  partners: "Đối tác",
  feedback: "Phản hồi",
  settings: "Cài đặt",
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const location = useLocation();

  // Auto-generate items from path if not provided
  const breadcrumbItems: BreadcrumbItem[] =
    items ||
    (() => {
      const paths = location.pathname.split("/").filter(Boolean);
      // Skip locale (en/vi/ja)
      const relevantPaths = paths.slice(1);

      return [
        { label: "Trang chủ", path: "/admin/dashboard" },
        ...relevantPaths.map((path, index) => {
          const fullPath = "/" + paths.slice(0, index + 2).join("/");
          return {
            label: pathMap[path] || path,
            path: index < relevantPaths.length - 1 ? fullPath : undefined,
          };
        }),
      ];
    })();

  return (
    <nav
      className={cn(
        "flex items-center gap-2 text-sm text-gray-500",
        className
      )}
    >
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <div key={index} className="flex items-center gap-2">
            {index === 0 ? (
              <Link
                to={item.path || "/admin/dashboard"}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ) : (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                {isLast || !item.path ? (
                  <span
                    className={cn(
                      isLast && "font-medium text-gray-900",
                      "max-w-[200px] truncate"
                    )}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className="hover:text-blue-600 transition-colors max-w-[200px] truncate"
                  >
                    {item.label}
                  </Link>
                )}
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}

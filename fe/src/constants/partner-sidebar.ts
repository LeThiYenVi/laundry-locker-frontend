import {
  LayoutDashboard,
  Package,
  Users,
  DollarSign,
  Boxes,
  Settings,
  Briefcase,
} from "lucide-react";

export const PARTNER_NAV_ITEMS = [
  {
    path: "/partner/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    path: "/partner/orders",
    label: "Orders",
    icon: Package,
  },
  {
    path: "/partner/staff",
    label: "Staff",
    icon: Users,
  },
  {
    path: "/partner/revenue",
    label: "Revenue",
    icon: DollarSign,
  },
  {
    path: "/partner/lockers",
    label: "Lockers",
    icon: Boxes,
  },
  {
    path: "/partner/services",
    label: "Services",
    icon: Briefcase,
  },
  {
    path: "/partner/settings",
    label: "Settings",
    icon: Settings,
  },
] as const;

export const PARTNER_SIDEBAR_CONFIG = {
  width: "w-20",
  expandedWidth: "w-64",
  bgColor: "bg-blue-950 opacity-90",
  hoverBgColor: "hover:bg-orange-600",
  activeBgColor: "bg-orange-600",
  textColor: "text-white",
  inactiveTextColor: "text-gray-400",
} as const;

export const PARTNER_SIDEBAR_BRAND = {
  name: "LaundryLocker",
  subtitle: "Partner Portal",
} as const;

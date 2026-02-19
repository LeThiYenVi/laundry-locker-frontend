import {
  LayoutDashboard,
  Package,
  Users,
  DollarSign,
  Boxes,
  Settings,
  Bell,
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
    path: "/partner/notifications",
    label: "Notifications",
    icon: Bell,
  },
  {
    path: "/partner/settings",
    label: "Profile & Settings",
    icon: Settings,
  },
] as const;

export const PARTNER_SIDEBAR_CONFIG = {
  width: "w-20",
  bgColor: "bg-gradient-to-b from-blue-900 to-blue-950",
  textColor: "text-white",
  hoverBgColor: "hover:bg-white/10",
  activeBgColor: "bg-white/20",
  inactiveTextColor: "text-gray-400",
} as const;

export const PARTNER_SIDEBAR_BRAND = {
  name: "LaundryLocker",
  subtitle: "Partner Portal",
} as const;

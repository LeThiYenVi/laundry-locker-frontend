import { Home, Network, Truck, Link2, Globe, Users, Package, BarChart3, Calendar } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  path: string;
  label: string;
  permission?: string; // Optional permission required to access
}

// Sidebar Navigation Items
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { 
    icon: Home, 
    path: "/admin/dashboard", 
    label: "Dashboard" 
  },
  { 
    icon: Network, 
    path: "/admin/network", 
    label: "Network",
    permission: "view_network"
  },
  { 
    icon: Truck, 
    path: "/admin/lockers", 
    label: "Lockers",
    permission: "manage_lockers"
  },
  { 
    icon: Package, 
    path: "/admin/orders", 
    label: "Orders",
    permission: "view_orders"
  },
  { 
    icon: Users, 
    path: "/admin/users", 
    label: "Users",
    permission: "manage_users"
  },
  { 
    icon: BarChart3, 
    path: "/admin/analytics", 
    label: "Analytics",
    permission: "view_analytics"
  },
  { 
    icon: Calendar, 
    path: "/admin/schedule", 
    label: "Schedule",
    permission: "view_schedule"
  },
  { 
    icon: Link2, 
    path: "/admin/integrations", 
    label: "Integrations",
    permission: "manage_integrations"
  },
  { 
    icon: Globe, 
    path: "/admin/settings", 
    label: "Settings",
    permission: "manage_settings"
  },
];

// Sidebar Brand Config
export const SIDEBAR_BRAND = {
  logo: "L",
  name: "Laundry Locker",
  tagline: "Admin Portal",
};

// Sidebar Styling Config
export const SIDEBAR_CONFIG = {
  width: "w-20", // Collapsed width
  expandedWidth: "w-64", // Expanded width (for future hover feature)
  bgColor: "bg-blue-950",
  hoverBgColor: "hover:bg-orange-600",
  activeBgColor: "bg-orange-600",
  textColor: "text-white",
  inactiveTextColor: "text-gray-400",
};

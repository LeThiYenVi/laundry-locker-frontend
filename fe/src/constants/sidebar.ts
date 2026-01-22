import { Home, Network, Truck, Link2, Globe, Users, Package, BarChart3, Calendar, ListOrdered, Users2, UserCog } from "lucide-react";
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
    icon: Truck, 
    path: "/admin/lockers", 
    label: "Lockers",
    permission: "manage_lockers"
  },
  { 
    icon: UserCog, 
    path: "/admin/users", 
    label: "Users",
    permission: "manage_users"
  },
  { 
    icon: Package, 
    path: "/admin/orders", 
    label: "Orders",
    permission: "view_orders"
  },


  { 
    icon: ListOrdered, 
    path: "/admin/feedback", 
    label: "Feedback",
    permission: "manage_feedback"
  },
  { 
    icon: Users, 
    path: "/admin/partners", 
    label: "Partners",
    permission: "manage_partners"
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
  bgColor: "bg-blue-950 opacity-90",
  hoverBgColor: "hover:bg-orange-600",
  activeBgColor: "bg-orange-600",
  textColor: "text-white",
  inactiveTextColor: "text-gray-400",
};

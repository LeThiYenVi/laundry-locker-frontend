import { Home, Truck, Users, Package, ListOrdered, UserCog, Store, Sparkles, CreditCard, Gift, Handshake } from "lucide-react";
import type { NavItem } from "@/types";

// Sidebar Navigation Items
export const ADMIN_NAV_ITEMS: NavItem[] = [
  { 
    icon: Home, 
    path: "/admin/dashboard", 
    label: "Dashboard" 
  },
  { 
    icon: UserCog, 
    path: "/admin/users", 
    label: "Users",
    permission: "manage_users"
  },
  { 
    icon: Store, 
    path: "/admin/stores", 
    label: "Stores",
    permission: "manage_stores"
  },
  { 
    icon: Truck, 
    path: "/admin/lockers", 
    label: "Lockers",
    permission: "manage_lockers"
  },
  { 
    icon: Sparkles, 
    path: "/admin/services", 
    label: "Services",
    permission: "manage_services"
  },
  { 
    icon: Package, 
    path: "/admin/orders", 
    label: "Orders",
    permission: "view_orders"
  },
  { 
    icon: CreditCard, 
    path: "/admin/payments", 
    label: "Payments",
    permission: "view_payments"
  },
  { 
    icon: Gift, 
    path: "/admin/loyalty", 
    label: "Loyalty",
    permission: "manage_loyalty"
  },
  { 
    icon: Handshake, 
    path: "/admin/partners", 
    label: "Partners",
    permission: "manage_partners"
  },
  { 
    icon: ListOrdered, 
    path: "/admin/feedback", 
    label: "Feedback",
    permission: "manage_feedback"
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

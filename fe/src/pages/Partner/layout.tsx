import * as React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { withLocale } from "@/lib/i18n";
import { User, Settings, LogOut, Bell } from "lucide-react";
import {
  PARTNER_NAV_ITEMS,
  PARTNER_SIDEBAR_CONFIG,
} from "@/constants/partner-sidebar";
import { useAuth } from "@/context/auth-context";
import LockrIcon from "~/components/ui/LockrIcon";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Badge } from "~/components/ui";

const PartnerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [notificationCount, setNotificationCount] = React.useState(3);

  const handleLogout = async () => {
    await logout();
    navigate(withLocale("/auth/login"));
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`${PARTNER_SIDEBAR_CONFIG.width} ${PARTNER_SIDEBAR_CONFIG.bgColor} ${PARTNER_SIDEBAR_CONFIG.textColor} flex flex-col items-center py-6 fixed h-full z-50`}
      >
        {/* Brand Logo */}
        <div className="mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
            <LockrIcon />
          </div>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 flex flex-col gap-6">
          {PARTNER_NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);

            return (
              <div key={idx} className="relative">
                <button
                  onClick={() => navigate(withLocale(item.path))}
                  className={`p-3 rounded-xl transition-all duration-200 ${PARTNER_SIDEBAR_CONFIG.hoverBgColor} ${
                    isActive
                      ? `${PARTNER_SIDEBAR_CONFIG.activeBgColor} ${PARTNER_SIDEBAR_CONFIG.textColor}`
                      : PARTNER_SIDEBAR_CONFIG.inactiveTextColor
                  }`}
                  title={item.label}
                >
                  <Icon size={24} />
                </button>

                {/* Notification Badge for Notifications */}
                {item.path === "/partner/notifications" &&
                  notificationCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                      {notificationCount}
                    </Badge>
                  )}
              </div>
            );
          })}
        </nav>

        {/* User Avatar + Menu */}
        <div className="mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="User menu"
                className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200"
              >
                <User size={20} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-blue-950">
              <div className="px-3 py-2 text-amber-100">
                <p className="font-semibold">{user?.fullName || "Partner"}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => navigate(withLocale("/partner/settings"))}
              >
                <div className="flex items-center gap-2 text-amber-100 opacity-75 hover:opacity-100">
                  <Settings size={16} /> Settings
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout}>
                <div className="flex items-center gap-2 text-amber-100 opacity-75 hover:opacity-100">
                  <LogOut size={16} /> Logout
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-20">
        <Outlet />
      </main>
    </div>
  );
};

export default PartnerLayout;

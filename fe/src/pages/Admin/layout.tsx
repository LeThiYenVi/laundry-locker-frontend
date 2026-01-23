import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { withLocale } from "@/lib/i18n";
import { User, Settings, LogOut } from "lucide-react";
import { ADMIN_NAV_ITEMS, SIDEBAR_BRAND, SIDEBAR_CONFIG } from "../../constants/sidebar";
import { useAuth } from "../../context/auth-context";
import LockrIcon from "~/components/ui/LockrIcon";
import SettingsModal from "./settings";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import React from "react";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission, logout } = useAuth();
  const [openSettings, setOpenSettings] = React.useState(false);
  const prevPathRef = React.useRef<string | null>(null);

  // Filter nav items based on user permissions
  const visibleNavItems = ADMIN_NAV_ITEMS.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  // remember previous path so we can restore it when opening modal via URL
  React.useEffect(() => {
    // if current path is settings route, open modal and restore previous
    const isSettingsPath = location.pathname.endsWith('/admin/settings') || location.pathname.includes('/admin/settings');
    if (isSettingsPath) {
      setOpenSettings(true);
      // navigate back to previous path if available
      if (prevPathRef.current && prevPathRef.current !== location.pathname) {
        navigate(prevPathRef.current, { replace: true });
      } else {
        // fallback to dashboard
        navigate(withLocale('/admin/dashboard'), { replace: true });
      }
    } else {
      // update previous path when not on settings
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex">
      {/* Modern Sidebar - Dark Theme */}
      <aside className={`${SIDEBAR_CONFIG.width} ${SIDEBAR_CONFIG.bgColor} ${SIDEBAR_CONFIG.textColor} flex flex-col items-center py-6 fixed h-full z-50`}>
        {/* Brand Logo */}
        <div className="mb-12">
          <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center font-bold text-xl shadow-lg">
           <LockrIcon />
          </div>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 flex flex-col gap-6">
          {visibleNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname.endsWith(item.path);
            return (
              <button
                key={idx}
                onClick={() => navigate(withLocale(item.path))}
                className={`p-3 rounded-xl transition-all duration-200 ${SIDEBAR_CONFIG.hoverBgColor} ${
                  isActive ? `${SIDEBAR_CONFIG.activeBgColor} ${SIDEBAR_CONFIG.textColor}` : SIDEBAR_CONFIG.inactiveTextColor
                }`}
                title={item.label}
              >
                <Icon size={24} />
              </button>
            );
          })}
        </nav>

        {/* User Avatar */}
        {/* User Avatar + Menu */}
        <div className="mt-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="User menu" className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200">
                <User size={20} />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent  className="bg-blue-950 opacity-100  ">
                <DropdownMenuItem onSelect={() => setOpenSettings(true)}>
                  <div className="flex items-center gap-2 text-amber-100 opacity-25 hover:opacity-100"><Settings size={16} /> Settings</div>
                </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={async () => { await logout(); navigate(withLocale('/auth/login')); }}>
                <div className="flex items-center gap-2 text-amber-100 opacity-25 hover:opacity-100"><LogOut size={16} /> Logout</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Settings Modal */}
        <SettingsModal open={openSettings} onOpenChange={setOpenSettings} />
      </aside>

      {/* Main Content Area - Dynamic Outlet */}
      <main className="flex-1 ml-20">
        <Outlet />
      </main> 
    </div>
  );
};

export default AdminLayout;
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { withLocale } from "@/lib/i18n";
import { User } from "lucide-react";
import { ADMIN_NAV_ITEMS, SIDEBAR_BRAND, SIDEBAR_CONFIG } from "../../constants/sidebar";
import { useAuth } from "../../context/auth-context";
import LockrIcon from "~/components/ui/LockrIcon";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();

  // Filter nav items based on user permissions
  const visibleNavItems = ADMIN_NAV_ITEMS.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

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
        <div className="mt-auto">
          <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200">
            <User size={20} />
          </div>
        </div>
      </aside>

      {/* Main Content Area - Dynamic Outlet */}
      <main className="flex-1 ml-20">
        <Outlet />
      </main> 
    </div>
  );
};

export default AdminLayout;
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { withLocale } from "@/lib/i18n";
import { User, Settings, LogOut } from "lucide-react";
import { ADMIN_NAV_ITEMS, SIDEBAR_CONFIG } from "../../constants/sidebar";
import { useAuth } from "../../context/auth-context";
import Logo from "~/assets/images/logo/Logo.svg";
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
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const prevPathRef = React.useRef<string | null>(null);

  const visibleNavItems = ADMIN_NAV_ITEMS.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  React.useEffect(() => {
    const isSettingsPath = location.pathname.endsWith('/admin/settings') || location.pathname.includes('/admin/settings');
    if (isSettingsPath) {
      setOpenSettings(true);
      if (prevPathRef.current && prevPathRef.current !== location.pathname) {
        navigate(prevPathRef.current, { replace: true });
      } else {
        navigate(withLocale('/admin/dashboard'), { replace: true });
      }
    } else {
      prevPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  // Close sidebar when dropdown opens
  React.useEffect(() => {
    if (isDropdownOpen) {
      setIsSidebarExpanded(false);
    }
  }, [isDropdownOpen]);

  return (
    <div className="min-h-screen flex">
      <aside 
        className={`${SIDEBAR_CONFIG.bgColor} ${SIDEBAR_CONFIG.textColor} flex flex-col items-center py-6 fixed h-full z-50 transition-all duration-300 ease-in-out ${
          isSidebarExpanded ? 'w-64' : SIDEBAR_CONFIG.width
        }`}
        onMouseEnter={() => !isDropdownOpen && setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className={`mb-8 transition-all duration-300 ${isSidebarExpanded ? 'self-start px-4' : 'flex justify-center'}`}>
          <img 
            src={Logo} 
            alt="Logo" 
            className={`transition-all duration-300 object-contain ${isSidebarExpanded ? 'h-16 w-auto' : 'h-10 w-10'}`}
          />
        </div>

        <nav className={`flex-1 flex flex-col gap-2 w-full px-2`}>
          {visibleNavItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname.endsWith(item.path);
            
            return (
              <button
                key={idx}
                onClick={() => navigate(withLocale(item.path))}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? `${SIDEBAR_CONFIG.activeBgColor} ${SIDEBAR_CONFIG.textColor}` 
                    : `${SIDEBAR_CONFIG.inactiveTextColor} ${SIDEBAR_CONFIG.hoverBgColor}`
                }`}
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  <Icon size={22} />
                </div>
                
                <span 
                  className={`whitespace-nowrap text-sm font-medium transition-all duration-300 overflow-hidden ${
                    isSidebarExpanded ? 'w-auto opacity-100 translate-x-0' : 'w-0 opacity-0 -translate-x-2'
                  }`}
                >
                  {item.label}
                </span>

                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-orange-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        <div className={`mt-auto w-full px-2`}>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <button 
                aria-label="User menu" 
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 w-full hover:bg-white/10 ${
                  isSidebarExpanded ? '' : 'justify-center'
                }`}
              >
                <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <User size={18} />
                </div>
                <span 
                  className={`whitespace-nowrap text-sm font-medium transition-all duration-300 overflow-hidden ${
                    isSidebarExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
                  }`}
                >
                  Admin
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              className="w-56 bg-white border-slate-200 shadow-lg shadow-slate-200/50 rounded-xl p-1 z-[100]"
              side="right"
              align="end"
              sideOffset={8}
            >
              <DropdownMenuItem 
                onSelect={() => setOpenSettings(true)}
                className="rounded-lg hover:bg-orange-50 cursor-pointer focus:bg-orange-50"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <Settings size={16} className="text-orange-500" /> 
                  <span>Settings</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              <DropdownMenuItem 
                onSelect={async () => { await logout(); navigate(withLocale('/auth/login')); }}
                className="rounded-lg hover:bg-orange-50 cursor-pointer focus:bg-orange-50"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <LogOut size={16} className="text-orange-500" /> 
                  <span>Logout</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <SettingsModal open={openSettings} onOpenChange={setOpenSettings} />
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <Outlet />
      </main> 
    </div>
  );
};

export default AdminLayout;

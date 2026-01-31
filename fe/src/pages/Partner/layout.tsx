import * as React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { withLocale } from "@/lib/i18n";
import { User, Settings, LogOut } from "lucide-react";
import { t } from "@/lib/i18n";
import {
  PARTNER_NAV_ITEMS,
  PARTNER_SIDEBAR_CONFIG,
} from "@/constants/partner-sidebar";
import { useAuth } from "@/context/auth-context";
import Logo from "~/assets/images/logo/Logo.svg";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";

const PartnerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate(withLocale("/auth/login"));
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`${PARTNER_SIDEBAR_CONFIG.bgColor} ${PARTNER_SIDEBAR_CONFIG.textColor} flex flex-col items-center py-6 fixed h-full z-50 transition-[width] duration-300 ease-out will-change-[width] ${
          isSidebarExpanded ? 'w-64' : PARTNER_SIDEBAR_CONFIG.width
        }`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        {/* Brand Logo */}
        <div className={`mb-8 transition-all duration-300 ease-out ${isSidebarExpanded ? 'self-start px-4' : 'flex justify-center'}`}>
          <img
            src={Logo}
            alt="Logo"
            className={`transition-all duration-300 ease-out object-contain ${isSidebarExpanded ? 'h-16 w-auto' : 'h-10 w-10'}`}
          />
        </div>

        {/* Navigation Items */}
        <nav className={`flex-1 flex flex-col gap-2 w-full px-2`}>
          {PARTNER_NAV_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname.includes(item.path);

            return (
              <button
                key={idx}
                onClick={() => navigate(withLocale(item.path))}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 group relative overflow-hidden ${
                  isActive
                    ? `${PARTNER_SIDEBAR_CONFIG.activeBgColor} ${PARTNER_SIDEBAR_CONFIG.textColor}`
                    : `${PARTNER_SIDEBAR_CONFIG.inactiveTextColor} ${PARTNER_SIDEBAR_CONFIG.hoverBgColor}`
                }`}
              >
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                  <Icon size={22} />
                </div>

                <span
                  className={`whitespace-nowrap text-sm font-medium transition-all duration-300 ease-out origin-left ${
                    isSidebarExpanded 
                      ? 'opacity-100 translate-x-0 scale-100' 
                      : 'opacity-0 -translate-x-4 scale-95 pointer-events-none'
                  }`}
                >
                  {t(`partner.nav.${item.label.toLowerCase().replace(' ', '')}`)}
                </span>

                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-orange-400 rounded-full transition-opacity duration-300" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Avatar + Menu */}
        <div className={`mt-auto w-full px-2`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="User menu"
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 w-full hover:bg-white/10 overflow-hidden ${
                  isSidebarExpanded ? '' : 'justify-center'
                }`}
              >
                <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <User size={18} />
                </div>
                <span
                  className={`whitespace-nowrap text-sm font-medium transition-all duration-300 ease-out origin-left ${
                    isSidebarExpanded 
                      ? 'opacity-100 translate-x-0 scale-100' 
                      : 'opacity-0 -translate-x-4 scale-95 pointer-events-none'
                  }`}
                >
                  {user?.fullName || t("partner.dashboard.title")}
                </span>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
              className="w-56 bg-white border-slate-200 shadow-lg shadow-slate-200/50 rounded-xl p-1"
              side="right"
              align="end"
            >
              {/* User Info Header */}
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{user?.fullName || "Partner"}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              
              <DropdownMenuItem 
                onSelect={() => navigate(withLocale("/partner/settings"))}
                className="rounded-lg hover:bg-orange-50 cursor-pointer focus:bg-orange-50 mt-1"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <Settings size={16} className="text-orange-500" /> 
                  <span>{t("partner.settings.title")}</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              
              <DropdownMenuItem 
                onSelect={handleLogout}
                className="rounded-lg hover:bg-orange-50 cursor-pointer focus:bg-orange-50"
              >
                <div className="flex items-center gap-2 text-slate-700">
                  <LogOut size={16} className="text-orange-500" /> 
                  <span>{t("button.logout")}</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-[margin] duration-300 ease-out will-change-[margin] ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default PartnerLayout;

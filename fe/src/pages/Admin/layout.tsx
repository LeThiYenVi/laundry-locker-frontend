import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "~/components/shared/layout/Sidebar";
import { MockBanner } from "~/components/shared/mock-indicator";
import { useAuth } from "~/context/auth-context";
import { ADMIN_NAV_ITEMS } from "~/constants/sidebar";
import SettingsModal from "./settings";

export default function AdminLayout() {
  const { hasPermission } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const visibleNavItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mock Data Banner */}
      <MockBanner />

      <Sidebar
        items={visibleNavItems}
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main Content - Responsive padding */}
      <main
        className="transition-all duration-300 ease-in-out min-h-screen
          lg:ml-0
          pt-16 lg:pt-0
          px-4 sm:px-6 lg:px-8"
      >
        <div className="py-6 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </div>
  );
}

import { lazy, Suspense, type ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./protected-route";
import AuthLayout from "../pages/auth/layout";
import AdminLayout from "../pages/Admin/layout";
import RootLayout from "../pages/RootLayout";

// Partner Layout (eager loaded as it's small)
import PartnerLayout from "../pages/Partner/layout";

// Error Pages (eager loaded for immediate display)
import {
  MaintenancePage,
  NotFoundPage,
  UnauthorizedPage,
} from "../pages/Error";

// Loading fallback component
function PageLoader(): ReactNode {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Đang tải...</p>
      </div>
    </div>
  );
}

// Lazy load Admin Pages
const DashboardPage = lazy(() => import("../pages/Admin/dashboard/dash-board"));
const UsersPage = lazy(() => import("../pages/Admin/users"));
const OrdersPage = lazy(() => import("../pages/Admin/orders"));
const OrderDetailPage = lazy(() => import("../pages/Admin/orders/detail"));
const FeedbackPage = lazy(() => import("../pages/Admin/feedback"));
const PartnersPage = lazy(() => import("../pages/Admin/partners"));
const LockersPage = lazy(() => import("../pages/Admin/lockers"));
const LockerDetailPage = lazy(() => import("../pages/Admin/lockers/detail"));
const StoresPage = lazy(() => import("../pages/Admin/stores"));
const ServicesPage = lazy(() => import("../pages/Admin/services"));
const PaymentsPage = lazy(() => import("../pages/Admin/payments"));
const LoyaltyPage = lazy(() => import("../pages/Admin/loyalty"));

// Lazy load Auth Pages
const LoginPage = lazy(() => import("~/pages/auth/Login"));

// Lazy load Partner Pages
const PartnerDashboard = lazy(() => import("../pages/Partner/dashboard"));
const PartnerOrders = lazy(() => import("../pages/Partner/orders"));
const PartnerStaff = lazy(() => import("../pages/Partner/staff"));
const PartnerRevenue = lazy(() => import("../pages/Partner/revenue"));
const PartnerLockers = lazy(() => import("../pages/Partner/lockers"));
const PartnerServices = lazy(() => import("../pages/Partner/services"));
const PartnerNotifications = lazy(() => import("../pages/Partner/notifications"));
const PartnerSettings = lazy(() => import("../pages/Partner/settings"));

// Wrapper for lazy components
function LazyWrapper({ children }: { children: ReactNode }): ReactNode {
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  );
}

const routesConfig: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/en/admin/dashboard" replace />,
  },

  {
    path: ":locale",
    element: <RootLayout />,
    children: [
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LazyWrapper><LoginPage /></LazyWrapper> },
          { path: "register", element: <div>Register Page</div> },
        ],
      },

      {
        path: "admin",
        element: (
          <ProtectedRoute requiredPermission="admin_access">
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "dashboard", element: <LazyWrapper><DashboardPage /></LazyWrapper> },
          { path: "users", element: <LazyWrapper><UsersPage /></LazyWrapper> },
          { path: "stores", element: <LazyWrapper><StoresPage /></LazyWrapper> },
          { path: "lockers", element: <LazyWrapper><LockersPage /></LazyWrapper> },
          { path: "lockers/:lockerId", element: <LazyWrapper><LockerDetailPage /></LazyWrapper> },
          { path: "services", element: <LazyWrapper><ServicesPage /></LazyWrapper> },
          { path: "orders", element: <LazyWrapper><OrdersPage /></LazyWrapper> },
          { path: "orders/:orderId", element: <LazyWrapper><OrderDetailPage /></LazyWrapper> },
          { path: "payments", element: <LazyWrapper><PaymentsPage /></LazyWrapper> },
          { path: "loyalty", element: <LazyWrapper><LoyaltyPage /></LazyWrapper> },
          { path: "partners", element: <LazyWrapper><PartnersPage /></LazyWrapper> },
          { path: "feedback", element: <LazyWrapper><FeedbackPage /></LazyWrapper> },
        ],
      },

      {
        path: "partner",
        element: (
          <ProtectedRoute requiredPermission="partner_access">
            <PartnerLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "dashboard", element: <LazyWrapper><PartnerDashboard /></LazyWrapper> },
          { path: "orders", element: <LazyWrapper><PartnerOrders /></LazyWrapper> },
          { path: "staff", element: <LazyWrapper><PartnerStaff /></LazyWrapper> },
          { path: "revenue", element: <LazyWrapper><PartnerRevenue /></LazyWrapper> },
          { path: "lockers", element: <LazyWrapper><PartnerLockers /></LazyWrapper> },
          { path: "services", element: <LazyWrapper><PartnerServices /></LazyWrapper> },
          { path: "notifications", element: <LazyWrapper><PartnerNotifications /></LazyWrapper> },
          { path: "settings", element: <LazyWrapper><PartnerSettings /></LazyWrapper> },
          { path: "profile", element: <Navigate to="../settings" replace /> },
        ],
      },

      // Error pages
      { path: "401", element: <UnauthorizedPage /> },
      { path: "403", element: <UnauthorizedPage /> },
      { path: "404", element: <NotFoundPage /> },
      { path: "503", element: <MaintenancePage /> },
      { path: "maintenance", element: <MaintenancePage /> },

      // Catch-all 404
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];

export default routesConfig;

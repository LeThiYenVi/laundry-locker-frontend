import { lazy, Suspense } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./protected-route";
import AuthLayout from "../pages/auth/layout";
import AdminLayout from "../pages/Admin/layout";
import PartnerLayout from "../pages/Partner/layout";
import RootLayout from "../pages/RootLayout";
import { PageLoading } from "~/components/ui/loading";

// Lazy load pages
// Admin Pages
const DashboardPage = lazy(() => import("../pages/Admin/dash-board"));
const OrdersPage = lazy(() => import("../pages/Admin/orders"));
const FeedbackPage = lazy(() => import("../pages/Admin/feedback"));
const PartnersPage = lazy(() => import("../pages/Admin/partners"));
const LockersPage = lazy(() => import("../pages/Admin/lockers"));
const UsersPage = lazy(() => import("../pages/Admin/users"));
const StoresPage = lazy(() => import("../pages/Admin/stores"));
const ServicesPage = lazy(() => import("../pages/Admin/services"));
const PaymentsPage = lazy(() => import("../pages/Admin/payments"));
const LoyaltyPage = lazy(() => import("../pages/Admin/loyalty"));

// Partner Pages
const PartnerDashboard = lazy(() => import("../pages/Partner/dashboard"));
const PartnerOrders = lazy(() => import("../pages/Partner/orders"));
const PartnerProfile = lazy(() => import("../pages/Partner/profile"));
const PartnerStaff = lazy(() => import("../pages/Partner/staff"));
const PartnerRevenue = lazy(() => import("../pages/Partner/revenue"));
const PartnerLockers = lazy(() => import("../pages/Partner/lockers"));
const PartnerServices = lazy(() => import("../pages/Partner/services"));
const PartnerNotifications = lazy(() => import("../pages/Partner/notifications"));
const PartnerSettings = lazy(() => import("../pages/Partner/settings"));

// Auth Pages
const LoginPage = lazy(() => import("~/pages/auth/Login"));

// Error Pages
const MaintenancePage = lazy(() => import("../pages/Error/Maintenance"));
const NotFoundPage = lazy(() => import("../pages/Error/NotFound"));
const UnauthorizedPage = lazy(() => import("../pages/Error/Unauthorized"));

// Wrapper component for Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoading />}>
    <Component />
  </Suspense>
);

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
          { path: "login", element: withSuspense(LoginPage) },
          { path: "register", element: <div>Register Page</div> },
        ],
      },

      {
        path: "admin",
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "dashboard", element: withSuspense(DashboardPage) },
          { path: "users", element: withSuspense(UsersPage) },
          { path: "stores", element: withSuspense(StoresPage) },
          { path: "lockers", element: withSuspense(LockersPage) },
          { path: "services", element: withSuspense(ServicesPage) },
          { path: "orders", element: withSuspense(OrdersPage) },
          { path: "payments", element: withSuspense(PaymentsPage) },
          { path: "loyalty", element: withSuspense(LoyaltyPage) },
          { path: "partners", element: withSuspense(PartnersPage) },
          { path: "feedback", element: withSuspense(FeedbackPage) },
        ],
      },

      {
        path: "partner",
        element: (
          <ProtectedRoute requiredRole="PARTNER">
            <PartnerLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "dashboard", element: withSuspense(PartnerDashboard) },
          { path: "orders", element: withSuspense(PartnerOrders) },
          { path: "staff", element: withSuspense(PartnerStaff) },
          { path: "revenue", element: withSuspense(PartnerRevenue) },
          { path: "lockers", element: withSuspense(PartnerLockers) },
          { path: "services", element: withSuspense(PartnerServices) },
          { path: "notifications", element: withSuspense(PartnerNotifications) },
          { path: "settings", element: withSuspense(PartnerSettings) },
          { path: "profile", element: withSuspense(PartnerProfile) },
        ],
      },

      // Error pages
      { path: "401", element: withSuspense(UnauthorizedPage) },
      { path: "403", element: withSuspense(UnauthorizedPage) },
      { path: "404", element: withSuspense(NotFoundPage) },
      { path: "503", element: withSuspense(MaintenancePage) },
      { path: "maintenance", element: withSuspense(MaintenancePage) },

      // Catch-all 404
      { path: "*", element: withSuspense(NotFoundPage) },
    ],
  },
];

export default routesConfig;

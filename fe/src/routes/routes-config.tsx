import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "./protected-route";
import AuthLayout from "../pages/auth/layout";
import AdminLayout from "../pages/Admin/layout";
import DashboardPage from "../pages/Admin/dash-board";
import OrdersPage from "../pages/Admin/orders";
import FeedbackPage from "../pages/Admin/feedback";
import PartnersPage from "../pages/Admin/partners";
import LockersPage from "../pages/Admin/lockers";
import UsersPage from "../pages/Admin/users";
import { Navigate } from "react-router-dom";
import LoginPage from "~/pages/auth/Login";
import RootLayout from "../pages/RootLayout";
import {
  MaintenancePage,
  NotFoundPage,
  UnauthorizedPage,
} from "../pages/Error";

// Partner Pages
import PartnerLayout from "../pages/Partner/layout";
import PartnerDashboard from "../pages/Partner/dashboard";
import PartnerOrders from "../pages/Partner/orders";
import PartnerStaff from "../pages/Partner/staff";
import PartnerRevenue from "../pages/Partner/revenue";
import PartnerLockers from "../pages/Partner/lockers";
import PartnerServices from "../pages/Partner/services";
import PartnerNotifications from "../pages/Partner/notifications";
import PartnerSettings from "../pages/Partner/settings";

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
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <div>Register Page</div> },
        ],
      },

      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "lockers", element: <LockersPage /> },
          { path: "users", element: <UsersPage /> },
          { path: "orders", element: <OrdersPage /> },
          { path: "feedback", element: <FeedbackPage /> },
          { path: "partners", element: <PartnersPage /> },
          {
            path: "users",
            element: (
              <ProtectedRoute requiredPermission="manage_users">
                <div>User List</div>
              </ProtectedRoute>
            ),
          },
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
          { path: "dashboard", element: <PartnerDashboard /> },
          { path: "orders", element: <PartnerOrders /> },
          { path: "staff", element: <PartnerStaff /> },
          { path: "revenue", element: <PartnerRevenue /> },
          { path: "lockers", element: <PartnerLockers /> },
          { path: "services", element: <PartnerServices /> },
          { path: "notifications", element: <PartnerNotifications /> },
          { path: "settings", element: <PartnerSettings /> },
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

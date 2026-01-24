
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
import { MaintenancePage, NotFoundPage, UnauthorizedPage } from "../pages/Error";

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
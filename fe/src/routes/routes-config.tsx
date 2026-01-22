
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "./protected-route";
import AuthLayout from "../pages/auth/layout";
import AdminLayout from "../pages/Admin/layout";
import DashboardPage from "../pages/Admin/dash-board";
import OrdersPage from "../pages/Admin/orders";
import FeedbackPage from "../pages/Admin/feedback";
import PartnersPage from "../pages/Admin/partners";
import LockersPage from "../pages/Admin/lockers";
import { Navigate } from "react-router-dom";
import LoginPage from "~/pages/auth/Login";
import RootLayout from "../pages/RootLayout";

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

      { path: "403", element: <div>403 Forbidden</div> },
      { path: "*", element: <div>404 Not Found</div> },
    ],
  },
];

export default routesConfig;
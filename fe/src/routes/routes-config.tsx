
import type { RouteObject } from "react-router-dom";
import ProtectedRoute from "./protected-route";
import AuthLayout from "../pages/auth/layout";
import AdminLayout from "../pages/Admin/layout";
import DashboardPage from "../pages/Admin/dash-board";
import { Navigate } from "react-router-dom";


const routesConfig: RouteObject[] = [
  {
    path: "/",
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <div>Login Page</div> },
      { path: "register", element: <div>Register Page</div> },
    ],
  },

  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <DashboardPage /> },
      { 
        path: "users", 
        element: (
          <ProtectedRoute requiredPermission="manage_users">
            <div>User List</div>
          </ProtectedRoute>
        ) 
      },
    ],
  },

  { path: "/403", element: <div>403 Forbidden</div> },
  { path: "*", element: <div>404 Not Found</div> },
];

export default routesConfig;
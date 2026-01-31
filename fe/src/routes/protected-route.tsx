import { Navigate, Outlet, useLocation } from "react-router-dom";
import { withLocale } from "@/lib/i18n";
import type { JSX } from "react/jsx-dev-runtime";
import { useAuth } from "../context/auth-context";

interface ProtectedRouteProps {
  requiredRole?: "ADMIN" | "PARTNER" | "ANY";
  requiredPermission?: string;
  children?: JSX.Element;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole = "ANY",
  requiredPermission 
}: ProtectedRouteProps) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={withLocale("/auth/login")} replace state={{ from: location }} />;
  }

  // Check role requirements
  if (requiredRole !== "ANY") {
    const userRoles = user.role || [];
    const isAdmin = userRoles.some(role => 
      role.toUpperCase() === 'SUPER_ADMIN' || role.toUpperCase() === 'ADMIN'
    );
    const isPartner = userRoles.some(role => 
      role.toUpperCase() === 'PARTNER' || role.toUpperCase() === 'PARTNER_STAFF'
    );

    if (requiredRole === "ADMIN" && !isAdmin) {
      return <Navigate to={withLocale("/403")} replace />;
    }

    if (requiredRole === "PARTNER" && !isPartner && !isAdmin) {
      return <Navigate to={withLocale("/403")} replace />;
    }
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={withLocale("/403")} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthContextType, User } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Development mode - Auto login as admin
const DEV_MODE = true;

// Mock admin user
const mockAdminUser: User = {
  id: "1",
  fullName: "Admin User",
  email: "admin@laundry.com",
  role: ["SUPER_ADMIN"],
  permissions: ["*"],
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // In development mode, auto-login with mock admin
        if (DEV_MODE) {
          setUser(mockAdminUser);
          localStorage.setItem("accessToken", `dev-token-${Date.now()}`);
          localStorage.setItem("user", JSON.stringify(mockAdminUser));
          setLoading(false);
          return;
        }

        // Production mode: Check localStorage
        const accessToken = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem("user");

        if (accessToken && userStr) {
          const parsedUser = JSON.parse(userStr);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("Lỗi khi khởi tạo auth:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Mock login - accept any credentials in dev mode
      if (DEV_MODE) {
        setUser(mockAdminUser);
        localStorage.setItem("accessToken", `dev-token-${Date.now()}`);
        localStorage.setItem("user", JSON.stringify(mockAdminUser));
        setLoading(false);
        return;
      }

      // TODO: Implement real API login when backend is ready
      throw new Error("API login chưa được implement");
    } catch (err: any) {
      const errorMessage = err?.message || "Đăng nhập thất bại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setError(null);
  };

  const hasPermission = (requiredPermission: string): boolean => {
    if (!user) return false;

    // Super admin has all permissions
    if (user.role.some(role => role.toUpperCase() === 'SUPER_ADMIN')) return true;

    // Check if user has wildcard permission
    if (user.permissions.includes('*')) return true;

    // Check specific permission
    return user.permissions.includes(requiredPermission);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading, 
        error,
        login, 
        logout, 
        hasPermission 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
  }
  return context;
};

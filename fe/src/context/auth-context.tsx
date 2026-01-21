import { createContext, useContext, useState, useEffect, type ReactNode, } from "react";
import type { AuthContextType, User } from "../types";
import { mockAuthAPI, mockDevUser } from "../mockdata/auth.mock";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Development mode flag - set to true to bypass login
const DEV_MODE = true;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // In development mode, auto-login with mock user
        if (DEV_MODE) {
          setUser(mockDevUser);
          localStorage.setItem("accessToken", `dev-token-${Date.now()}`);
          localStorage.setItem("user", JSON.stringify(mockDevUser));
          setLoading(false);
          return;
        }

        // Production mode: Check localStorage
        const accessToken = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem("user");

        if (accessToken && userStr) {
          // Validate token
          const isValid = await mockAuthAPI.validateToken(accessToken);
          
          if (isValid) {
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            setUser(null);
          }
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

      // Call mock API
      const response = await mockAuthAPI.login(username, password);

      // Save to localStorage
      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      setUser(response.user);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Đăng nhập thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await mockAuthAPI.logout();
    } catch (error) {
      console.error("Lỗi khi logout:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      setUser(null);
      setError(null);
    }
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
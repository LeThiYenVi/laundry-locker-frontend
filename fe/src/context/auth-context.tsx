import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthContextType, User } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Admin Auth State for 2FA
interface AdminAuthState {
  isWaitingFor2FA: boolean;
  tempToken: string | null;
  maskedEmail: string | null;
}

// Partner Auth State for OTP
interface PartnerAuthState {
  isWaitingForOTP: boolean;
  contactInfo: string | null; // email or phone
  contactType: 'EMAIL' | 'PHONE' | null;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Admin 2FA state
  const [adminAuthState, setAdminAuthState] = useState<AdminAuthState>({
    isWaitingFor2FA: false,
    tempToken: null,
    maskedEmail: null,
  });

  // Partner OTP state
  const [partnerAuthState, setPartnerAuthState] = useState<PartnerAuthState>({
    isWaitingForOTP: false,
    contactInfo: null,
    contactType: null,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem("user");

        if (accessToken && userStr) {
          const parsedUser = JSON.parse(userStr);
          const normalizedUser: User = {
            id: String(parsedUser.id || parsedUser.userId || ''),
            email: parsedUser.email || '',
            fullName: parsedUser.fullName || parsedUser.name || '',
            role: parsedUser.role || ["SUPER_ADMIN"],
            permissions: parsedUser.permissions || ["*"],
            avatar: parsedUser.avatar,
          };
          setUser(normalizedUser);
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

  // ============================================
  // ADMIN AUTH (2FA Flow)
  // ============================================

  const adminLoginStep1 = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      setAdminAuthState({
        isWaitingFor2FA: true,
        tempToken: data.data.tempToken,
        maskedEmail: data.data.maskedEmail,
      });
    } catch (err: any) {
      const errorMessage = err?.message || "Đăng nhập thất bại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const adminLoginStep2 = async (otpCode: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!adminAuthState.tempToken) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/admin/auth/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempToken: adminAuthState.tempToken, otpCode }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Xác thực OTP thất bại');
      }

      const { accessToken, refreshToken, user: adminUser } = data.data;
      
      const mappedUser: User = {
        id: String(adminUser.id),
        email: adminUser.email,
        fullName: adminUser.name || adminUser.email,
        role: adminUser.role || ["SUPER_ADMIN"],
        permissions: adminUser.permissions || ["*"],
      };
      
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      
      setUser(mappedUser);
      
      setAdminAuthState({
        isWaitingFor2FA: false,
        tempToken: null,
        maskedEmail: null,
      });
    } catch (err: any) {
      const errorMessage = err?.message || "Xác thực OTP thất bại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelAdmin2FA = () => {
    setAdminAuthState({
      isWaitingFor2FA: false,
      tempToken: null,
      maskedEmail: null,
    });
    setError(null);
  };

  // ============================================
  // PARTNER AUTH (Uses User Auth Flow - Email/Phone OTP)
  // ============================================

  // Step 1: Send OTP (Email) or Phone Login (Phone)
  const partnerSendOTP = async (contact: string, type: 'EMAIL' | 'PHONE'): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      let response;
      
      if (type === 'EMAIL') {
        // Email: Send OTP
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/email/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: contact }),
        });
      } else {
        // Phone: Send OTP via Firebase (or backend handles it)
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/phone-login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: contact }),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Không thể gửi OTP');
      }

      setPartnerAuthState({
        isWaitingForOTP: true,
        contactInfo: contact,
        contactType: type,
      });
    } catch (err: any) {
      const errorMessage = err?.message || "Không thể gửi OTP";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and login (Partner is existing user, no newUser handling)
  const partnerVerifyOTP = async (otpCode: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!partnerAuthState.contactInfo || !partnerAuthState.contactType) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      let response;
      
      if (partnerAuthState.contactType === 'EMAIL') {
        // Email: Verify OTP
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/email/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: partnerAuthState.contactInfo,
            otp: otpCode 
          }),
        });
      } else {
        // Phone: Verify OTP (Firebase or backend)
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/phone-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            phone: partnerAuthState.contactInfo,
            otp: otpCode 
          }),
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Mã OTP không đúng');
      }

      // Partner is existing user, directly get tokens and user from response
      const { accessToken, refreshToken, user: partnerUser } = data.data;
      
      const mappedUser: User = {
        id: String(partnerUser?.id || ''),
        email: partnerUser?.email || '',
        fullName: partnerUser?.fullName || partnerUser?.name || '',
        role: partnerUser?.roles || partnerUser?.role || ["ROLE_PARTNER"],
        permissions: partnerUser?.permissions || ["partner_access"],
        avatar: partnerUser?.avatar,
      };
      
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      
      setUser(mappedUser);
      
      setPartnerAuthState({
        isWaitingForOTP: false,
        contactInfo: null,
        contactType: null,
      });
    } catch (err: any) {
      const errorMessage = err?.message || "Xác thực OTP thất bại";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const cancelPartnerOTP = () => {
    setPartnerAuthState({
      isWaitingForOTP: false,
      contactInfo: null,
      contactType: null,
    });
    setError(null);
  };

  // ============================================
  // SHARED FUNCTIONS
  // ============================================

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenStr = localStorage.getItem("refreshToken");
      if (!refreshTokenStr) return false;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenStr }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) return false;

      localStorage.setItem("accessToken", data.data.accessToken);
      if (data.data.refreshToken) {
        localStorage.setItem("refreshToken", data.data.refreshToken);
      }
      
      return true;
    } catch (error) {
      console.error("Refresh token failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setUser(null);
      setAdminAuthState({
        isWaitingFor2FA: false,
        tempToken: null,
        maskedEmail: null,
      });
      setPartnerAuthState({
        isWaitingForOTP: false,
        contactInfo: null,
        contactType: null,
      });
      setError(null);
    }
  };

  const hasPermission = (requiredPermission: string): boolean => {
    if (!user) return false;
    if (user.role?.some(role => role.toUpperCase() === 'SUPER_ADMIN')) return true;
    if (user.permissions?.includes('*')) return true;
    return user.permissions?.includes(requiredPermission) || false;
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated, 
        loading, 
        error,
        login: async () => {}, // Legacy, use specific flows below
        logout, 
        hasPermission,
        refreshToken,
        // Admin 2FA
        isWaitingFor2FA: adminAuthState.isWaitingFor2FA,
        maskedEmail: adminAuthState.maskedEmail,
        adminLoginStep1,
        adminLoginStep2,
        cancelAdmin2FA,
        // Partner OTP
        isWaitingForOTP: partnerAuthState.isWaitingForOTP,
        partnerContactInfo: partnerAuthState.contactInfo,
        partnerContactType: partnerAuthState.contactType,
        partnerSendOTP,
        partnerVerifyOTP,
        cancelPartnerOTP,
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

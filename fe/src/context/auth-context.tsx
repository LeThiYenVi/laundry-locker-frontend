import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { AuthContextType, User } from "../types";
import { API_BASE_URL, AUTH_ENDPOINTS } from "../constants/api-paths";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: call API with JSON
async function apiFetch<T>(endpoint: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const accessToken = localStorage.getItem("accessToken")?.replace(/\s/g, "");
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.message || `Request failed (${res.status})`);
  }
  return (json?.data ?? json) as T;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ── Admin 2FA state ──
  const [isWaitingFor2FA, setIsWaitingFor2FA] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState("");
  const [tempToken, setTempToken] = useState("");

  // ── Partner OTP state ──
  const [isWaitingForOTP, setIsWaitingForOTP] = useState(false);
  const [partnerContactInfo, setPartnerContactInfo] = useState("");

  // ── Initialise from localStorage ──
  useEffect(() => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");
      if (accessToken && userStr) {
        const parsed = JSON.parse(userStr);
        // Normalize - ensure arrays exist even for legacy cached data
        setUser({
          ...parsed,
          role: parsed.role ?? [],
          permissions: parsed.permissions ?? [],
        });
      }
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper: persist login result
  const persistLogin = (data: {
    accessToken: string;
    refreshToken?: string;
    user: User;
  }) => {
    localStorage.setItem("accessToken", data.accessToken.replace(/\s/g, ""));
    if (data.refreshToken)
      localStorage.setItem(
        "refreshToken",
        data.refreshToken.replace(/\s/g, ""),
      );
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  // ============================================
  // Legacy simple login (kept for backward compat)
  // ============================================
  const login = async (username: string, password: string) => {
    setError(null);
    const data = await apiFetch<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>(AUTH_ENDPOINTS.LOGIN, { email: username, password });
    persistLogin(data);
  };

  // ============================================
  // Admin 2FA Login
  // ============================================
  const adminLoginStep1 = async (email: string, password: string) => {
    setError(null);
    const data = await apiFetch<{
      requiresTwoFactor: boolean;
      tempToken: string;
      maskedEmail: string;
      expiresIn: number;
      message: string;
    }>(AUTH_ENDPOINTS.ADMIN_LOGIN, { email, password });

    setTempToken(data.tempToken);
    setMaskedEmail(data.maskedEmail);
    setIsWaitingFor2FA(true);
  };

  const adminLoginStep2 = async (otpCode: string) => {
    setError(null);
    const data = await apiFetch<{
      accessToken: string;
      refreshToken: string;
      user: User;
    }>(AUTH_ENDPOINTS.ADMIN_VERIFY_2FA, { tempToken, otpCode });

    setIsWaitingFor2FA(false);
    setTempToken("");
    setMaskedEmail("");
    persistLogin(data);
  };

  const cancelAdmin2FA = () => {
    setIsWaitingFor2FA(false);
    setTempToken("");
    setMaskedEmail("");
    setError(null);
  };

  // ============================================
  // Partner OTP Login
  // ============================================
  const partnerSendOTP = async (
    email: string,
    contactType: "EMAIL" | "PHONE",
  ) => {
    setError(null);
    const endpoint =
      contactType === "EMAIL"
        ? AUTH_ENDPOINTS.EMAIL_SEND_OTP
        : AUTH_ENDPOINTS.PHONE_LOGIN;

    await apiFetch<{ message: string }>(endpoint, { email });

    setPartnerContactInfo(email);
    setIsWaitingForOTP(true);
  };

  const partnerVerifyOTP = async (otpCode: string) => {
    setError(null);
    const data = await apiFetch<{
      accessToken: string;
      refreshToken: string;
      userInfo: {
        id: number;
        email: string;
        name?: string;
        firstName?: string;
        lastName?: string;
        imageUrl?: string | null;
      };
    }>(AUTH_ENDPOINTS.EMAIL_VERIFY_OTP, {
      email: partnerContactInfo,
      otp: otpCode,
    });

    // Decode roles from JWT payload
    let roles: string[] = [];
    try {
      const payload = JSON.parse(atob(data.accessToken.split(".")[1]));
      roles = payload.roles ?? [];
    } catch {
      /* ignore decode errors */
    }

    const user: User = {
      id: String(data.userInfo.id),
      fullName:
        data.userInfo.name ||
        `${data.userInfo.firstName ?? ""} ${data.userInfo.lastName ?? ""}`.trim(),
      email: data.userInfo.email,
      role: roles,
      permissions: [],
      avatar: data.userInfo.imageUrl ?? undefined,
    };

    setIsWaitingForOTP(false);
    setPartnerContactInfo("");
    persistLogin({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user,
    });
  };

  const cancelPartnerOTP = () => {
    setIsWaitingForOTP(false);
    setPartnerContactInfo("");
    setError(null);
  };

  // ============================================
  // Logout & Permissions
  // ============================================
  const logout = async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setError(null);
    cancelAdmin2FA();
    cancelPartnerOTP();
  };

  const hasPermission = (requiredPermission: string): boolean => {
    if (!user) return false;

    const roles = user.role ?? [];
    const permissions = user.permissions ?? [];

    // Strip optional "ROLE_" prefix for comparison
    const normalizeRole = (r: string) => r.toUpperCase().replace(/^ROLE_/, "");

    // SUPER_ADMIN bypasses everything
    if (roles.some((r) => normalizeRole(r) === "SUPER_ADMIN")) return true;
    if (permissions.includes("*")) return true;
    if (permissions.includes(requiredPermission)) return true;

    // Role → implicit permissions mapping (backend returns roles, not fine-grained permissions)
    const rolePermissions: Record<string, string[]> = {
      ADMIN: ["admin_access"],
      PARTNER: ["partner_access"],
      PARTNER_STAFF: ["partner_access"],
      USER: [],
    };

    return roles.some((r) =>
      (rolePermissions[normalizeRole(r)] ?? []).includes(requiredPermission),
    );
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
        hasPermission,
        // Admin 2FA
        isWaitingFor2FA,
        maskedEmail,
        adminLoginStep1,
        adminLoginStep2,
        cancelAdmin2FA,
        // Partner OTP
        isWaitingForOTP,
        partnerContactInfo,
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

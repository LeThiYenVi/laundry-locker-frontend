import type { User, AuthResponse } from "../types/auth";

// Mock Users Data - Only Admin for login
export const mockUsers: User[] = [
  {
    id: "1",
    fullName: "Admin User",
    email: "admin@laundry.com",
    role: ["SUPER_ADMIN"],
    permissions: ["*"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
  },
];

// Mock Login Credentials - Only Admin
export const mockCredentials = {
  admin: { username: "admin@laundry.com", password: "admin123" },
};

// Mock Auth API
export const mockAuthAPI = {
  // Simulate login API call
  login: async (
    username: string,
    password: string
  ): Promise<AuthResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Only admin can login
    if (
      username === mockCredentials.admin.username &&
      password === mockCredentials.admin.password
    ) {
      const user = mockUsers[0];
      return {
        accessToken: `mock-jwt-token-${user.id}-${Date.now()}`,
        refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
        user,
      };
    }

    throw new Error("Invalid username or password");
  },

  // Simulate token validation
  validateToken: async (token: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return token.startsWith("mock-jwt-token-");
  },

  // Simulate logout
  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return;
  },
};

// Mock default user for development (bypass login)
export const mockDevUser: User = mockUsers[0]; // Admin by default


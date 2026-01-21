import type { User, AuthResponse } from "../types/auth";

// Mock Users Data
export const mockUsers: User[] = [
  {
    id: "1",
    fullName: "Admin User",
    email: "admin@laundry.com",
    role: ["SUPER_ADMIN"],
    permissions: ["*"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
  },
  {
    id: "2",
    fullName: "Manager User",
    email: "manager@laundry.com",
    role: ["MANAGER"],
    permissions: [
      "manage_users",
      "view_analytics",
      "manage_lockers",
      "manage_orders",
    ],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Manager",
  },
  {
    id: "3",
    fullName: "Staff User",
    email: "staff@laundry.com",
    role: ["STAFF"],
    permissions: ["view_orders", "update_orders", "view_lockers"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Staff",
  },
  {
    id: "4",
    fullName: "Customer User",
    email: "customer@laundry.com",
    role: ["CUSTOMER"],
    permissions: ["view_own_orders", "create_orders"],
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Customer",
  },
];

// Mock Login Credentials
export const mockCredentials = {
  admin: { username: "admin", password: "admin123" },
  manager: { username: "manager", password: "manager123" },
  staff: { username: "staff", password: "staff123" },
  customer: { username: "customer", password: "customer123" },
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

    // Find user by credentials
    let user: User | undefined;

    if (
      username === mockCredentials.admin.username &&
      password === mockCredentials.admin.password
    ) {
      user = mockUsers[0];
    } else if (
      username === mockCredentials.manager.username &&
      password === mockCredentials.manager.password
    ) {
      user = mockUsers[1];
    } else if (
      username === mockCredentials.staff.username &&
      password === mockCredentials.staff.password
    ) {
      user = mockUsers[2];
    } else if (
      username === mockCredentials.customer.username &&
      password === mockCredentials.customer.password
    ) {
      user = mockUsers[3];
    }

    if (!user) {
      throw new Error("Invalid username or password");
    }

    return {
      accessToken: `mock-jwt-token-${user.id}-${Date.now()}`,
      refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
      user,
    };
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

import type { AdminUserResponse } from "~/types";
import { AuthProvider, RoleName } from "~/types/admin/enums";

export const mockUsers: AdminUserResponse[] = [
  {
    id: 1,
    email: "admin@laundry.com",
    name: "Admin User",
    imageUrl: "",
    provider: AuthProvider.EMAIL,
    emailVerified: true,
    enabled: true,
    roles: [RoleName.ADMIN],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    email: "staff1@laundry.com",
    name: "Staff One",
    imageUrl: "",
    provider: AuthProvider.EMAIL,
    emailVerified: true,
    enabled: true,
    roles: [RoleName.STAFF],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
  },
  {
    id: 3,
    email: "user1@gmail.com",
    name: "Nguyễn Văn A",
    imageUrl: "",
    provider: AuthProvider.GOOGLE,
    emailVerified: true,
    enabled: true,
    roles: [RoleName.USER],
    createdAt: "2024-02-01T08:00:00Z",
    updatedAt: "2024-02-01T08:00:00Z",
  },
  {
    id: 4,
    email: "user2@yahoo.com",
    name: "Trần Thị B",
    imageUrl: "",
    provider: AuthProvider.EMAIL,
    emailVerified: false,
    enabled: false,
    roles: [RoleName.USER],
    createdAt: "2024-02-10T14:20:00Z",
    updatedAt: "2024-02-10T14:20:00Z",
  },
  {
    id: 5,
    email: "partner@store.com",
    name: "Partner Store",
    imageUrl: "",
    provider: AuthProvider.EMAIL,
    emailVerified: true,
    enabled: true,
    roles: [RoleName.PARTNER],
    createdAt: "2024-02-15T09:00:00Z",
    updatedAt: "2024-02-15T09:00:00Z",
  },
  {
    id: 6,
    email: "pending@example.com",
    name: "",
    imageUrl: "",
    provider: AuthProvider.EMAIL,
    emailVerified: false,
    enabled: true,
    roles: [RoleName.USER],
    createdAt: "2024-02-20T16:45:00Z",
    updatedAt: "2024-02-20T16:45:00Z",
  },
  {
    id: 7,
    email: "moderator@laundry.com",
    name: "Moderator",
    imageUrl: "",
    provider: AuthProvider.EMAIL,
    emailVerified: true,
    enabled: true,
    roles: [RoleName.MODERATOR],
    createdAt: "2024-03-01T11:00:00Z",
    updatedAt: "2024-03-01T11:00:00Z",
  },
  {
    id: 8,
    email: "inactive@example.com",
    name: "Inactive User",
    imageUrl: "",
    provider: AuthProvider.FACEBOOK,
    emailVerified: true,
    enabled: false,
    roles: [RoleName.USER],
    createdAt: "2024-03-05T13:30:00Z",
    updatedAt: "2024-03-05T13:30:00Z",
  },
];

// Generate more mock data for pagination testing
export const generateMockUsers = (count: number): AdminUserResponse[] => {
  const roles = [RoleName.USER, RoleName.STAFF, RoleName.PARTNER];
  const providers = [AuthProvider.EMAIL, AuthProvider.GOOGLE, AuthProvider.FACEBOOK];
  const users: AdminUserResponse[] = [];

  for (let i = 0; i < count; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString();
    users.push({
      id: 100 + i,
      email: `user${i + 10}@example.com`,
      name: `User ${i + 10}`,
      imageUrl: "",
      provider: providers[Math.floor(Math.random() * providers.length)],
      emailVerified: Math.random() > 0.2,
      enabled: Math.random() > 0.3,
      roles: [roles[Math.floor(Math.random() * roles.length)]],
      createdAt,
      updatedAt: createdAt,
    });
  }

  return users;
};

export const allMockUsers = [...mockUsers, ...generateMockUsers(50)];
export { mockUsers as mockAdminUsers };

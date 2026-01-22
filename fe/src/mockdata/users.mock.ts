import type { UserRow } from "~/pages/Admin/users";

// Provide a small set of mock users for development & UI
export const sampleUsers: UserRow[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `U-${1000 + i}`,
  name: ["Alice", "Bob", "Carla", "Dan", "Eve", "Frank", "Gina", "Hank", "Ivy", "Jack"][i],
  avatar: undefined,
  role: i % 3 === 0 ? "Administrator" : i % 3 === 1 ? "Viewer" : "Moderator",
  status: i % 4 === 0 ? "Inactive" : "Active",
  socials: i % 2 === 0 ? ["github", "dribbble"] : ["facebook"],
  promoted: i % 2 === 0,
  rating: i % 2 === 0 ? 4 + (i % 3) : -(i % 3),
  lastLogin: "20 Nov 2022",
}));

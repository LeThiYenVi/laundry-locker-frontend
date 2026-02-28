import { useMemo, useState } from "react";
import { useGetAllUsersQuery } from "~/stores/apis/adminApi";
import { allMockUsers } from "~/mockdata/users.mock";
import { isMockEnabled, mockDelay } from "~/hooks/useMockData";
import type { AdminUserResponse } from "~/types";

export type UserStatus = "ALL" | "ACTIVE" | "INACTIVE" | "PENDING";

export function useUsers() {
  const [status, setStatus] = useState<UserStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Real API query
  const {
    data: apiData,
    isLoading: apiLoading,
    error: apiError,
    refetch,
  } = useGetAllUsersQuery(
    { pageNumber: page, pageSize },
    { skip: isMockEnabled } // Skip API call if mock is enabled
  );

  // Mock data state
  const [mockLoading, setMockLoading] = useState(isMockEnabled);
  
  // Simulate loading delay for mock data
  if (isMockEnabled && mockLoading) {
    setTimeout(() => setMockLoading(false), mockDelay);
  }

  // Get users from appropriate source
  const users = useMemo(() => {
    if (isMockEnabled) {
      return allMockUsers;
    }
    return apiData?.data?.content || [];
  }, [apiData]);

  const totalElements = isMockEnabled
    ? allMockUsers.length
    : apiData?.data?.totalElements || 0;
  const totalPages = isMockEnabled
    ? Math.ceil(allMockUsers.length / pageSize)
    : apiData?.data?.totalPages || 0;

  const isLoading = isMockEnabled ? mockLoading : apiLoading;
  const error = isMockEnabled ? null : apiError;

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Filter by status
    if (status !== "ALL") {
      result = result.filter((user) => {
        switch (status) {
          case "ACTIVE":
            return user.enabled;
          case "INACTIVE":
            return !user.enabled;
          case "PENDING":
            return !user.emailVerified;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.email?.toLowerCase().includes(query) ||
          user.name?.toLowerCase().includes(query) ||
          user.roles?.some((role) => role.toLowerCase().includes(query))
      );
    }

    // Pagination for mock data
    if (isMockEnabled) {
      const start = page * pageSize;
      result = result.slice(start, start + pageSize);
    }

    return result;
  }, [users, status, searchQuery, page, pageSize]);

  // Status counts
  const statusCounts = useMemo(() => {
    const baseUsers = isMockEnabled ? allMockUsers : users;
    return {
      ALL: baseUsers.length,
      ACTIVE: baseUsers.filter((u) => u.enabled).length,
      INACTIVE: baseUsers.filter((u) => !u.enabled).length,
      PENDING: baseUsers.filter((u) => !u.emailVerified).length,
    };
  }, [users]);

  // Clear all filters
  const clearFilters = () => {
    setStatus("ALL");
    setSearchQuery("");
    setPage(0);
  };

  // Check if any filter is active
  const hasActiveFilters = status !== "ALL" || searchQuery !== "";

  return {
    users: filteredUsers,
    totalElements,
    totalPages,
    isLoading,
    error,
    // Filters
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,
    // Actions
    refetch,
    clearFilters,
    hasActiveFilters,
    // Stats
    statusCounts,
    // Source indicator
    isMock: isMockEnabled,
  };
}

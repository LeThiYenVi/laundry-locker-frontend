import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useGetAllUsersQuery } from "~/stores/apis/adminApi";
import type { AdminUserResponse } from "~/types";

export type UserStatus = "ALL" | "ACTIVE" | "INACTIVE" | "PENDING";

export function useUsers() {
  const [status, setStatus] = useState<UserStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [urlParams, setUrlParams] = useSearchParams();
  const page = Number(urlParams.get("page") ?? "0");
  const pageSize = Number(urlParams.get("size") ?? "10");
  const setPage = (newPage: number) =>
    setUrlParams((prev) => { const next = new URLSearchParams(prev); next.set("page", String(newPage)); return next; });
  const setPageSize = (newSize: number) =>
    setUrlParams((prev) => { const next = new URLSearchParams(prev); next.set("size", String(newSize)); next.set("page", "0"); return next; });

  const {
    data: apiData,
    isLoading,
    error,
    refetch,
  } = useGetAllUsersQuery({ page, size: pageSize });

  const users: AdminUserResponse[] = apiData?.data?.content ?? [];
  const totalElements = apiData?.data?.totalElements ?? 0;
  const totalPages = apiData?.data?.totalPages ?? 0;

  const filteredUsers = useMemo(() => {
    let result = [...users];

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

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.email?.toLowerCase().includes(query) ||
          user.name?.toLowerCase().includes(query) ||
          user.roles?.some((role) => role.toLowerCase().includes(query)),
      );
    }

    return result;
  }, [users, status, searchQuery]);

  const statusCounts = useMemo(
    () => ({
      ALL: users.length,
      ACTIVE: users.filter((u) => u.enabled).length,
      INACTIVE: users.filter((u) => !u.enabled).length,
      PENDING: users.filter((u) => !u.emailVerified).length,
    }),
    [users],
  );

  const clearFilters = () => {
    setStatus("ALL");
    setSearchQuery("");
    setPage(0);
  };

  const hasActiveFilters = status !== "ALL" || searchQuery !== "";

  return {
    users: filteredUsers,
    totalElements,
    totalPages,
    isLoading,
    error,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    refetch,
    clearFilters,
    hasActiveFilters,
    statusCounts,
  };
}

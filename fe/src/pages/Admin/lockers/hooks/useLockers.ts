import { useMemo, useState } from "react";
import { LockerStatus } from "~/types/admin/enums";
import { useGetAllLockersQuery } from "~/stores/apis/admin";

export type LockerStatusFilter = "ALL" | LockerStatus;

export function useLockers() {
  const [status, setStatus] = useState<LockerStatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, refetch } = useGetAllLockersQuery({
    page: 0,
    size: 200,
  });

  const allLockers = data?.data?.content ?? [];

  const filteredLockers = useMemo(() => {
    let result = [...allLockers];

    if (status !== "ALL") {
      result = result.filter((locker) => locker.status === status);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (locker) =>
          locker.name?.toLowerCase().includes(query) ||
          locker.code?.toLowerCase().includes(query) ||
          locker.storeName?.toLowerCase().includes(query) ||
          locker.address?.toLowerCase().includes(query),
      );
    }

    return result;
  }, [allLockers, status, searchQuery]);

  const paginatedLockers = useMemo(() => {
    const start = page * pageSize;
    return filteredLockers.slice(start, start + pageSize);
  }, [filteredLockers, page, pageSize]);

  const statusCounts = useMemo(
    () => ({
      ALL: allLockers.length,
      [LockerStatus.ACTIVE]: allLockers.filter(
        (l) => l.status === LockerStatus.ACTIVE,
      ).length,
      [LockerStatus.INACTIVE]: allLockers.filter(
        (l) => l.status === LockerStatus.INACTIVE,
      ).length,
      [LockerStatus.MAINTENANCE]: allLockers.filter(
        (l) => l.status === LockerStatus.MAINTENANCE,
      ).length,
      [LockerStatus.DISCONNECTED]: allLockers.filter(
        (l) => l.status === LockerStatus.DISCONNECTED,
      ).length,
    }),
    [allLockers],
  );

  const clearFilters = () => {
    setStatus("ALL");
    setSearchQuery("");
    setPage(0);
  };

  const hasActiveFilters = status !== "ALL" || searchQuery !== "";

  return {
    lockers: paginatedLockers,
    totalElements: filteredLockers.length,
    totalPages: Math.ceil(filteredLockers.length / pageSize),
    isLoading,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    statusCounts,
    refetch,
    clearFilters,
    hasActiveFilters,
  };
}

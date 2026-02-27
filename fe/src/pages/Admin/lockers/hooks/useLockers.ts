import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { mockLockers, lockerStatistics, MockLocker } from "~/mockdata/lockers.mock";
import { LockerStatus } from "~/types/admin/enums";
import { isMockEnabled, mockDelay } from "~/hooks/useMockData";

export type LockerStatusFilter = "ALL" | LockerStatus;

export function useLockers() {
  const [status, setStatus] = useState<LockerStatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(isMockEnabled);

  if (isMockEnabled && isLoading) {
    setTimeout(() => setIsLoading(false), mockDelay);
  }

  const filteredLockers = useMemo(() => {
    let result = [...mockLockers];

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
          locker.address?.toLowerCase().includes(query)
      );
    }

    const start = page * pageSize;
    return result.slice(start, start + pageSize);
  }, [status, searchQuery, page, pageSize]);

  const statusCounts = useMemo(() => ({
    ALL: mockLockers.length,
    [LockerStatus.ACTIVE]: mockLockers.filter((l) => l.status === LockerStatus.ACTIVE).length,
    [LockerStatus.INACTIVE]: mockLockers.filter((l) => l.status === LockerStatus.INACTIVE).length,
    [LockerStatus.MAINTENANCE]: mockLockers.filter((l) => l.status === LockerStatus.MAINTENANCE).length,
    [LockerStatus.DISCONNECTED]: mockLockers.filter((l) => l.status === LockerStatus.DISCONNECTED).length,
  }), []);

  const handleViewDetails = useCallback((locker: MockLocker) => {
    toast.info(`Xem chi tiết tủ ${locker.name}`, {
      description: `Mã: ${locker.code}`,
    });
  }, []);

  const handleMaintenance = useCallback((lockerId: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Đang chuyển sang chế độ bảo trì...",
        success: "Đã chuyển tủ sang chế độ bảo trì!",
        error: "Không thể cập nhật",
      }
    );
  }, []);

  const handleActivate = useCallback((lockerId: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Đang kích hoạt tủ...",
        success: "Đã kích hoạt tủ thành công!",
        error: "Không thể kích hoạt",
      }
    );
  }, []);

  return {
    lockers: filteredLockers,
    totalElements: mockLockers.length,
    totalPages: Math.ceil(mockLockers.length / pageSize),
    statistics: lockerStatistics,
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
    handleViewDetails,
    handleMaintenance,
    handleActivate,
    isMock: isMockEnabled,
  };
}

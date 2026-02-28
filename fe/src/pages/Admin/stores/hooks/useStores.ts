import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { mockStores, MockStore } from "~/mockdata/stores.mock";
import { isMockEnabled, mockDelay } from "~/hooks/useMockData";

export type StoreStatus = "ALL" | "ACTIVE" | "INACTIVE";

export function useStores() {
  const [status, setStatus] = useState<StoreStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<MockStore | null>(null);
  const [isLoading, setIsLoading] = useState(isMockEnabled);

  if (isMockEnabled && isLoading) {
    setTimeout(() => setIsLoading(false), mockDelay);
  }

  const filteredStores = useMemo(() => {
    let result = [...mockStores];

    if (status !== "ALL") {
      result = result.filter((store) =>
        status === "ACTIVE" ? store.isActive : !store.isActive
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (store) =>
          store.name?.toLowerCase().includes(query) ||
          store.address?.toLowerCase().includes(query) ||
          store.managerName?.toLowerCase().includes(query)
      );
    }

    const start = page * pageSize;
    return result.slice(start, start + pageSize);
  }, [status, searchQuery, page, pageSize]);

  const statusCounts = useMemo(() => ({
    ALL: mockStores.length,
    ACTIVE: mockStores.filter((s) => s.isActive).length,
    INACTIVE: mockStores.filter((s) => !s.isActive).length,
  }), []);

  const handleCreate = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleEdit = useCallback((store: MockStore) => {
    setSelectedStore(store);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((storeId: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Đang xóa cửa hàng...",
        success: "Đã xóa cửa hàng thành công!",
        error: "Không thể xóa cửa hàng",
      }
    );
  }, []);

  // Refetch function
  const refetch = () => {
    if (isMockEnabled) {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), mockDelay);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStatus("ALL");
    setSearchQuery("");
    setPage(0);
  };

  // Check if any filter is active
  const hasActiveFilters = status !== "ALL" || searchQuery !== "";

  return {
    stores: filteredStores,
    totalElements: mockStores.length,
    totalPages: Math.ceil(mockStores.length / pageSize),
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
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedStore,
    handleCreate,
    handleEdit,
    handleDelete,
    isMock: isMockEnabled,
  };
}

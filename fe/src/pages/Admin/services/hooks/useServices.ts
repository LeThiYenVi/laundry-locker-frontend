import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { mockServices, MockService } from "~/mockdata/services.mock";
import { isMockEnabled, mockDelay } from "~/hooks/useMockData";

export type ServiceStatus = "ALL" | "ACTIVE" | "INACTIVE";

export function useServices() {
  const [status, setStatus] = useState<ServiceStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<MockService | null>(null);
  const [isLoading, setIsLoading] = useState(isMockEnabled);

  if (isMockEnabled && isLoading) {
    setTimeout(() => setIsLoading(false), mockDelay);
  }

  const filteredServices = useMemo(() => {
    let result = [...mockServices];

    if (status !== "ALL") {
      result = result.filter((service) =>
        status === "ACTIVE" ? service.isActive : !service.isActive
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (service) =>
          service.name?.toLowerCase().includes(query) ||
          service.description?.toLowerCase().includes(query)
      );
    }

    const start = page * pageSize;
    return result.slice(start, start + pageSize);
  }, [status, searchQuery, page, pageSize]);

  const statusCounts = useMemo(() => ({
    ALL: mockServices.length,
    ACTIVE: mockServices.filter((s) => s.isActive).length,
    INACTIVE: mockServices.filter((s) => !s.isActive).length,
  }), []);

  const handleCreate = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleEdit = useCallback((service: MockService) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  }, []);

  const handleDelete = useCallback((serviceId: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Đang xóa dịch vụ...",
        success: "Đã xóa dịch vụ thành công!",
        error: "Không thể xóa dịch vụ",
      }
    );
  }, []);

  const handleToggleStatus = useCallback((serviceId: number, currentStatus: boolean) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 800)),
      {
        loading: currentStatus ? "Đang vô hiệu hóa..." : "Đang kích hoạt...",
        success: currentStatus ? "Đã vô hiệu hóa dịch vụ" : "Đã kích hoạt dịch vụ",
        error: "Không thể cập nhật trạng thái",
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
    services: filteredServices,
    totalElements: mockServices.length,
    totalPages: Math.ceil(mockServices.length / pageSize),
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
    selectedService,
    handleCreate,
    handleEdit,
    handleDelete,
    handleToggleStatus,
    isMock: isMockEnabled,
  };
}

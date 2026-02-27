import { useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { mockPartners, getPaginatedPartners, partnerStatistics, MockPartner } from "~/mockdata/partners.mock";
import { PartnerStatus } from "~/types/admin/enums";
import { isMockEnabled, mockDelay } from "~/hooks/useMockData";

export type PartnerStatusFilter = "ALL" | PartnerStatus;

export function usePartners() {
  const [status, setStatus] = useState<PartnerStatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<MockPartner | null>(null);
  const [isLoading, setIsLoading] = useState(isMockEnabled);

  if (isMockEnabled && isLoading) {
    setTimeout(() => setIsLoading(false), mockDelay);
  }

  const filteredPartners = useMemo(() => {
    let result = [...mockPartners];

    if (status !== "ALL") {
      result = result.filter((partner) => partner.status === status);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (partner) =>
          partner.name?.toLowerCase().includes(query) ||
          partner.email?.toLowerCase().includes(query) ||
          partner.representativeName?.toLowerCase().includes(query)
      );
    }

    const start = page * pageSize;
    return result.slice(start, start + pageSize);
  }, [status, searchQuery, page, pageSize]);

  const statusCounts = useMemo(() => ({
    ALL: mockPartners.length,
    [PartnerStatus.PENDING]: mockPartners.filter((p) => p.status === PartnerStatus.PENDING).length,
    [PartnerStatus.APPROVED]: mockPartners.filter((p) => p.status === PartnerStatus.APPROVED).length,
    [PartnerStatus.REJECTED]: mockPartners.filter((p) => p.status === PartnerStatus.REJECTED).length,
    [PartnerStatus.SUSPENDED]: mockPartners.filter((p) => p.status === PartnerStatus.SUSPENDED).length,
  }), []);

  const handleCreate = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleEdit = useCallback((partner: MockPartner) => {
    setSelectedPartner(partner);
    setIsEditModalOpen(true);
  }, []);

  const handleApprove = useCallback((partnerId: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Đang phê duyệt...",
        success: "Đã phê duyệt đối tác thành công!",
        error: "Không thể phê duyệt",
      }
    );
  }, []);

  const handleReject = useCallback((partnerId: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Đang từ chối...",
        success: "Đã từ chối đối tác!",
        error: "Không thể từ chối",
      }
    );
  }, []);

  const handleSuspend = useCallback((partnerId: number) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1000)),
      {
        loading: "Đang đình chỉ...",
        success: "Đã đình chỉ đối tác!",
        error: "Không thể đình chỉ",
      }
    );
  }, []);

  return {
    partners: filteredPartners,
    totalElements: mockPartners.length,
    totalPages: Math.ceil(mockPartners.length / pageSize),
    statistics: partnerStatistics,
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
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedPartner,
    handleCreate,
    handleEdit,
    handleApprove,
    handleReject,
    handleSuspend,
    isMock: isMockEnabled,
  };
}

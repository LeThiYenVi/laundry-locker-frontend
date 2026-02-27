import { useMemo, useState } from "react";
import { mockPayments, paymentStatistics, MockPayment } from "~/mockdata/payments.mock";
import { PaymentStatus } from "~/types/admin/enums";
import { isMockEnabled, mockDelay } from "~/hooks/useMockData";

export type PaymentStatusFilter = "ALL" | PaymentStatus;

export function usePayments() {
  const [status, setStatus] = useState<PaymentStatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(isMockEnabled);

  if (isMockEnabled && isLoading) {
    setTimeout(() => setIsLoading(false), mockDelay);
  }

  const filteredPayments = useMemo(() => {
    let result = [...mockPayments];

    if (status !== "ALL") {
      result = result.filter((p) => p.status === status);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.id?.toLowerCase().includes(query) ||
          p.orderCode?.toLowerCase().includes(query) ||
          p.customerName?.toLowerCase().includes(query)
      );
    }

    const start = page * pageSize;
    return result.slice(start, start + pageSize);
  }, [status, searchQuery, page, pageSize]);

  const statusCounts = useMemo(() => ({
    ALL: mockPayments.length,
    [PaymentStatus.COMPLETED]: mockPayments.filter((p) => p.status === PaymentStatus.COMPLETED).length,
    [PaymentStatus.PENDING]: mockPayments.filter((p) => p.status === PaymentStatus.PENDING).length,
    [PaymentStatus.PROCESSING]: mockPayments.filter((p) => p.status === PaymentStatus.PROCESSING).length,
    [PaymentStatus.FAILED]: mockPayments.filter((p) => p.status === PaymentStatus.FAILED).length,
    [PaymentStatus.REFUNDED]: mockPayments.filter((p) => p.status === PaymentStatus.REFUNDED).length,
  }), []);

  return {
    payments: filteredPayments,
    totalElements: mockPayments.length,
    totalPages: Math.ceil(mockPayments.length / pageSize),
    statistics: paymentStatistics,
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
    isMock: isMockEnabled,
  };
}

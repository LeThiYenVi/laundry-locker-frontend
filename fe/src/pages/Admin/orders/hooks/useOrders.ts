import { useMemo, useState } from "react";
import { OrderStatus } from "~/types/admin/enums";
import { useGetAllOrdersQuery } from "@/stores/apis/admin/orders";
import type { OrderResponse } from "~/types/admin/order";

type OrderStatusFilter = "ALL" | OrderStatus;

export function useOrders() {
  const [status, setStatus] = useState<OrderStatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, refetch } = useGetAllOrdersQuery({
    pageNumber: page,
    pageSize,
    ...(status !== "ALL" ? { status } : {}),
  });

  const allOrders: OrderResponse[] = data?.data?.content ?? [];

  const filteredOrders = useMemo(() => {
    if (!searchQuery) return allOrders;
    const query = searchQuery.toLowerCase();
    return allOrders.filter(
      (order) =>
        String(order.id).includes(query) ||
        order.senderName?.toLowerCase().includes(query),
    );
  }, [allOrders, searchQuery]);

  const statusCounts = useMemo(
    () => ({
      ALL: data?.data?.totalElements ?? 0,
      [OrderStatus.INITIALIZED]: allOrders.filter(
        (o) => o.status === OrderStatus.INITIALIZED,
      ).length,
      [OrderStatus.RESERVED]: allOrders.filter(
        (o) => o.status === OrderStatus.RESERVED,
      ).length,
      [OrderStatus.WAITING]: allOrders.filter(
        (o) => o.status === OrderStatus.WAITING,
      ).length,
      [OrderStatus.COLLECTED]: allOrders.filter(
        (o) => o.status === OrderStatus.COLLECTED,
      ).length,
      [OrderStatus.PROCESSING]: allOrders.filter(
        (o) => o.status === OrderStatus.PROCESSING,
      ).length,
      [OrderStatus.READY]: allOrders.filter(
        (o) => o.status === OrderStatus.READY,
      ).length,
      [OrderStatus.RETURNED]: allOrders.filter(
        (o) => o.status === OrderStatus.RETURNED,
      ).length,
      [OrderStatus.COMPLETED]: allOrders.filter(
        (o) => o.status === OrderStatus.COMPLETED,
      ).length,
      [OrderStatus.CANCELED]: allOrders.filter(
        (o) => o.status === OrderStatus.CANCELED,
      ).length,
    }),
    [allOrders, data],
  );

  const clearFilters = () => {
    setStatus("ALL");
    setSearchQuery("");
    setPage(0);
  };

  const hasActiveFilters = status !== "ALL" || searchQuery !== "";

  return {
    orders: filteredOrders,
    totalElements: data?.data?.totalElements ?? 0,
    totalPages: data?.data?.totalPages ?? 0,
    isLoading,
    error: null,
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

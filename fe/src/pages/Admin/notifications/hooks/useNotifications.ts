import { useMemo, useState } from "react";
import {
  NotificationStatus,
  NotificationType,
  NotificationChannel,
} from "~/types/admin/enums";
import {
  useGetAllNotificationsQuery,
  useGetNotificationStatsQuery,
  useDeleteNotificationMutation,
  useBulkDeleteNotificationsMutation,
  useUpdateNotificationStatusMutation,
  useResendNotificationMutation,
} from "@/stores/apis/admin/notifications";
import type { AdminNotificationResponse } from "~/types/admin/notification";

export type NotificationStatusFilter = "ALL" | NotificationStatus;
export type NotificationTypeFilter = "ALL" | NotificationType;
export type NotificationChannelFilter = "ALL" | NotificationChannel;

export function useNotifications() {
  const [statusFilter, setStatusFilter] =
    useState<NotificationStatusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>("ALL");
  const [channelFilter, setChannelFilter] =
    useState<NotificationChannelFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, refetch } = useGetAllNotificationsQuery({
    pageNumber: page,
    pageSize,
    ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
    ...(typeFilter !== "ALL" ? { type: typeFilter } : {}),
    ...(channelFilter !== "ALL" ? { channel: channelFilter } : {}),
  });

  const {
    data: statsData,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useGetNotificationStatsQuery();

  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();
  const [bulkDeleteNotifications, { isLoading: isBulkDeleting }] =
    useBulkDeleteNotificationsMutation();
  const [updateNotificationStatus, { isLoading: isUpdatingStatus }] =
    useUpdateNotificationStatusMutation();
  const [resendNotification, { isLoading: isResending }] =
    useResendNotificationMutation();

  const allNotifications: AdminNotificationResponse[] =
    data?.data?.content ?? [];

  const filteredNotifications = useMemo(() => {
    if (!searchQuery) return allNotifications;
    const query = searchQuery.toLowerCase();
    return allNotifications.filter(
      (n) =>
        n.title.toLowerCase().includes(query) ||
        n.recipientName.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        n.recipientEmail?.toLowerCase().includes(query) ||
        String(n.id).includes(query),
    );
  }, [allNotifications, searchQuery]);

  const stats = statsData?.data;

  const clearFilters = () => {
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setChannelFilter("ALL");
    setSearchQuery("");
    setPage(0);
  };

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    channelFilter !== "ALL" ||
    searchQuery !== "";

  const handleDelete = async (id: number) => {
    await deleteNotification(id).unwrap();
    refetchStats();
  };

  const handleBulkDelete = async (ids: number[]) => {
    await bulkDeleteNotifications(ids).unwrap();
    refetchStats();
  };

  const handleUpdateStatus = async (id: number, status: NotificationStatus) => {
    await updateNotificationStatus({ id, data: { status } }).unwrap();
    refetchStats();
  };

  const handleResend = async (id: number) => {
    await resendNotification(id).unwrap();
  };

  return {
    notifications: filteredNotifications,
    totalElements: data?.data?.totalElements ?? 0,
    totalPages: data?.data?.totalPages ?? 0,
    stats,
    isLoading,
    isLoadingStats,
    isDeleting,
    isBulkDeleting,
    isUpdatingStatus,
    isResending,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    channelFilter,
    setChannelFilter,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    pageSize,
    setPageSize,
    refetch,
    clearFilters,
    hasActiveFilters,
    handleDelete,
    handleBulkDelete,
    handleUpdateStatus,
    handleResend,
  };
}

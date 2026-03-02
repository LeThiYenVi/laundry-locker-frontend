import { useState, useCallback, useEffect, useMemo } from "react";
import {
  useGetPartnerOrdersQuery,
  useAcceptOrderMutation,
  useUpdateOrderWeightMutation,
  useProcessOrderMutation,
  useMarkOrderReadyMutation,
  POLLING_INTERVAL,
} from "@/stores/apis/partnerApi";
import { usePartnerWebSocket } from "@/hooks/useWebSocket";
import type { PartnerOrder, StaffAccessCode } from "@/types/partner.type";
import { OrderStatus } from "@/types/partner.enum";
import { KANBAN_COLUMNS } from "../board/kanban.config";
import { getErrorMessage } from "../utils/order-helpers";

// ============================================
// Types
// ============================================

export type BoardColumns = Record<OrderStatus, PartnerOrder[]>;

type AccessCodeModalState = {
  open: boolean;
  code: StaffAccessCode | null;
  action: "COLLECT" | "RETURN";
};

type WeightModalState = {
  open: boolean;
  order: PartnerOrder | null;
  weight: string;
};

// ============================================
// Hook
// ============================================

export function useOrderBoard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [errorToast, setErrorToast] = useState<string | null>(null);

  /**
   * Optimistic status overrides: orderId → pendingStatus
   * Applied immediately on drag so the UI doesn't flicker.
   * Rolled back on API error.
   */
  const [pendingMoves, setPendingMoves] = useState<Record<number, OrderStatus>>(
    {},
  );

  // Modal states
  const [accessCodeModal, setAccessCodeModal] = useState<AccessCodeModalState>({
    open: false,
    code: null,
    action: "COLLECT",
  });

  const [weightModal, setWeightModal] = useState<WeightModalState>({
    open: false,
    order: null,
    weight: "",
  });

  // Auto-hide error toast
  useEffect(() => {
    if (!errorToast) return;
    const t = setTimeout(() => setErrorToast(null), 5000);
    return () => clearTimeout(t);
  }, [errorToast]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Fetch all orders (large page to display Kanban)
  const { data, isLoading, isFetching, error, refetch } =
    useGetPartnerOrdersQuery(
      { page: 0, size: 200, search: debouncedSearch || undefined },
      {
        // WebSocket handles real-time — poll every 60s as fallback
        pollingInterval: POLLING_INTERVAL * 6,
        refetchOnFocus: false,
        refetchOnReconnect: true,
      },
    );

  // WebSocket real-time updates
  const handleOrderUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  const {
    connected: wsConnected,
    connect: wsConnect,
    error: wsError,
  } = usePartnerWebSocket({
    onOrderUpdate: handleOrderUpdate,
  });

  useEffect(() => {
    wsConnect();
  }, [wsConnect]);

  // Mutations
  const [acceptOrder, { isLoading: isAccepting }] = useAcceptOrderMutation();
  const [updateWeight, { isLoading: isUpdatingWeight }] =
    useUpdateOrderWeightMutation();
  const [processOrder, { isLoading: isProcessing }] = useProcessOrderMutation();
  const [markReady, { isLoading: isMarkingReady }] =
    useMarkOrderReadyMutation();

  // Apply optimistic overrides on top of API data
  const allOrders = useMemo(() => {
    const raw = data?.content ?? [];
    if (Object.keys(pendingMoves).length === 0) return raw;
    return raw.map((o) =>
      pendingMoves[o.id] !== undefined
        ? { ...o, status: pendingMoves[o.id] }
        : o,
    );
  }, [data, pendingMoves]);

  // Group by status for the board columns
  const boardColumns = useMemo<BoardColumns>(() => {
    const grouped = Object.fromEntries(
      KANBAN_COLUMNS.map((col) => [col.status, [] as PartnerOrder[]]),
    ) as BoardColumns;

    for (const order of allOrders) {
      const col = grouped[order.status as OrderStatus];
      if (col) col.push(order);
    }

    return grouped;
  }, [allOrders]);

  // ============================================
  // Drag-and-drop status change handler
  // ============================================

  const handleStatusChange = useCallback(
    async (
      order: PartnerOrder,
      newStatus: OrderStatus,
    ): Promise<StaffAccessCode | null> => {
      const prevStatus = order.status;

      // Apply optimistic update immediately
      setPendingMoves((prev) => ({ ...prev, [order.id]: newStatus }));

      try {
        let code: StaffAccessCode | null = null;

        if (
          newStatus === OrderStatus.COLLECTED &&
          prevStatus === OrderStatus.WAITING
        ) {
          const result = await acceptOrder(order.id).unwrap();
          code = result.staffAccessCode;
          setAccessCodeModal({ open: true, code, action: "COLLECT" });
        } else if (newStatus === OrderStatus.PROCESSING) {
          await processOrder(order.id).unwrap();
        } else if (newStatus === OrderStatus.READY) {
          const result = await markReady(order.id).unwrap();
          code = result.staffAccessCode;
          setAccessCodeModal({ open: true, code, action: "RETURN" });
        }

        // Clear the optimistic override after success (RTK cache will update)
        setPendingMoves((prev) => {
          const next = { ...prev };
          delete next[order.id];
          return next;
        });

        return code;
      } catch (err) {
        // Roll back optimistic update
        setPendingMoves((prev) => {
          const next = { ...prev };
          delete next[order.id];
          return next;
        });
        setErrorToast(getErrorMessage(err));
        return null;
      }
    },
    [acceptOrder, processOrder, markReady],
  );

  // ============================================
  // Weight update
  // ============================================

  const openWeightModal = useCallback((order: PartnerOrder) => {
    setWeightModal({
      open: true,
      order,
      weight: order.weight?.toString() ?? "",
    });
  }, []);

  const submitWeight = useCallback(async () => {
    if (!weightModal.order) return;
    const w = parseFloat(weightModal.weight);
    if (isNaN(w) || w <= 0) return;

    try {
      await updateWeight({
        orderId: weightModal.order.id,
        actualWeight: w,
        weightUnit: "kg",
      }).unwrap();
      setWeightModal({ open: false, order: null, weight: "" });
    } catch (err) {
      setErrorToast(getErrorMessage(err));
    }
  }, [weightModal, updateWeight]);

  return {
    // Board data
    boardColumns,
    isLoading,
    isFetching,
    error,
    refetch,
    totalOrders: allOrders.length,

    // Search
    searchQuery,
    setSearchQuery,

    // Status change (drag & drop)
    handleStatusChange,
    isAccepting,
    isProcessing,
    isMarkingReady,

    // Weight modal
    weightModal,
    setWeightModal,
    openWeightModal,
    submitWeight,
    isUpdatingWeight,

    // Access code modal
    accessCodeModal,
    setAccessCodeModal,

    // Error
    errorToast,
    setErrorToast,

    // WebSocket
    wsConnected,
    wsError,
  };
}

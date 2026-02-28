import { useState } from "react";
import { Package, RefreshCw, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { PageLoading, ErrorState } from "~/components/ui";
import { StatusDropdown } from "~/components/shared/status-tabs";
import { useOrders } from "./hooks/useOrders";
import { SearchFilter } from "./components/SearchFilter";
import { OrdersTable } from "./components/OrdersTable";
import { ErrorToast } from "./components/ErrorToast";
import { WebSocketIndicator } from "./components/WebSocketIndicator";
import { AccessCodeModal } from "./components/AccessCodeModal";
import { WeightUpdateModal } from "./components/WeightUpdateModal";
import type { PartnerOrder, StaffAccessCode } from "@/types/partner.type";
import type { OrderStatus } from "@/types/partner.enum";

const statusOptions = [
  { value: "ALL", label: "Tất cả", color: "blue" as const },
  { value: "WAITING", label: "Chờ xử lý", color: "yellow" as const },
  { value: "COLLECTED", label: "Đã lấy", color: "purple" as const },
  { value: "PROCESSING", label: "Đang xử lý", color: "blue" as const },
  { value: "READY", label: "Sẵn sàng", color: "green" as const },
  { value: "RETURNED", label: "Đã trả", color: "gray" as const },
  { value: "COMPLETED", label: "Hoàn thành", color: "green" as const },
];

export default function PartnerOrders() {
  const {
    activeTab,
    searchQuery,
    setSearchQuery,
    handleTabChange,
    orders,
    totalPages,
    totalElements,
    currentPage,
    size,
    isLoading,
    isFetching,
    error,
    refetch,
    setPage,
    getPageNumbers,
    handleAcceptOrder,
    handleUpdateWeight,
    handleProcessOrder,
    handleMarkReady,
    isAccepting,
    isUpdatingWeight,
    isProcessing,
    isMarkingReady,
    errorToast,
    setErrorToast,
    wsConnected,
    wsError,
  } = useOrders();
  const { t } = useTranslation();

  // Modal states
  const [accessCodeModal, setAccessCodeModal] = useState<{
    open: boolean;
    code: StaffAccessCode | null;
    action: "COLLECT" | "RETURN";
  }>({ open: false, code: null, action: "COLLECT" });

  const [weightModal, setWeightModal] = useState<{
    open: boolean;
    order: PartnerOrder | null;
    weight: string;
  }>({ open: false, order: null, weight: "" });

  // Handlers with modals
  const onAcceptOrder = async (order: PartnerOrder) => {
    const code = await handleAcceptOrder(order);
    if (code) {
      setAccessCodeModal({ open: true, code, action: "COLLECT" });
    }
  };

  const onMarkReady = async (order: PartnerOrder) => {
    const code = await handleMarkReady(order.id);
    if (code) {
      setAccessCodeModal({ open: true, code, action: "RETURN" });
    }
  };

  const onOpenWeightModal = (order: PartnerOrder) => {
    setWeightModal({
      open: true,
      order,
      weight: order.weight?.toString() || "",
    });
  };

  const onSubmitWeight = async () => {
    if (!weightModal.order || !weightModal.weight) return;
    const success = await handleUpdateWeight(
      weightModal.order.id,
      parseFloat(weightModal.weight),
    );
    if (success) {
      setWeightModal({ open: false, order: null, weight: "" });
    }
  };

  const clearFilters = () => {
    handleTabChange("ALL");
    setSearchQuery("");
  };

  const hasActiveFilters = activeTab !== "ALL" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Error Toast */}
      <ErrorToast message={errorToast} onClose={() => setErrorToast(null)} />

      {/* Polling Indicator */}
      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-blue-100 text-blue-700 px-3 py-2 rounded-full text-sm flex items-center gap-2 shadow">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            {t("partner.common.updating")}
          </div>
        </div>
      )}

      {/* WebSocket Indicator */}
      <WebSocketIndicator connected={wsConnected} error={wsError} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">
            {t("partner.orders.title")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t("partner.orders.subtitle")}
          </p>
        </div>
      </div>

      {/* Toolbar - 1 hàng */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <StatusDropdown
            options={statusOptions}
            value={activeTab}
            onChange={(value) => handleTabChange(value as OrderStatus | "ALL")}
            placeholder={t("common.status")}
          />
          <SearchFilter searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="h-9"
          >
            <X size={16} className="mr-1.5" />
            Xóa lọc
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isFetching}
            className="h-9"
          >
            <RefreshCw size={16} className={`mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Tải lại
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <PageLoading message={t("partner.orders.loadingTitle")} />
      ) : error ? (
        <ErrorState
          variant="server"
          title={t("partner.orders.errorTitle")}
          error={error}
          onRetry={refetch}
        />
      ) : (
        <OrdersTable
          orders={orders}
          totalPages={totalPages}
          totalElements={totalElements}
          currentPage={currentPage}
          pageSize={size}
          isAccepting={isAccepting}
          isProcessing={isProcessing}
          isMarkingReady={isMarkingReady}
          onPageChange={setPage}
          getPageNumbers={getPageNumbers}
          onAcceptOrder={onAcceptOrder}
          onOpenWeightModal={onOpenWeightModal}
          onProcessOrder={(order) => handleProcessOrder(order.id)}
          onMarkReady={onMarkReady}
        />
      )}

      {/* Modals */}
      <AccessCodeModal
        isOpen={accessCodeModal.open}
        onClose={() =>
          setAccessCodeModal({ open: false, code: null, action: "COLLECT" })
        }
        code={accessCodeModal.code}
        action={accessCodeModal.action}
      />

      <WeightUpdateModal
        isOpen={weightModal.open}
        onClose={() => setWeightModal({ open: false, order: null, weight: "" })}
        order={weightModal.order}
        weight={weightModal.weight}
        onWeightChange={(weight) =>
          setWeightModal((prev) => ({ ...prev, weight }))
        }
        onSubmit={onSubmitWeight}
        isLoading={isUpdatingWeight}
      />
    </div>
  );
}

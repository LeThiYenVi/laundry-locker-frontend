import { useState } from "react";
import { Package } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { PageLoading, ErrorState } from "~/components/ui";
import { useOrders } from "./hooks/useOrders";
import { SearchFilter } from "./components/SearchFilter";
import { OrdersTable } from "./components/OrdersTable";
import { ErrorToast } from "./components/ErrorToast";
import { WebSocketIndicator } from "./components/WebSocketIndicator";
import { AccessCodeModal } from "./components/AccessCodeModal";
import { WeightUpdateModal } from "./components/WeightUpdateModal";
import { STATUS_LABELS } from "./utils/order-helpers";
import type { PartnerOrder, StaffAccessCode } from "@/types/partner.type";

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
          <p className="text-muted-foreground mt-2">{t("partner.orders.subtitle")}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <SearchFilter searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Tabs & Table */}
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
        <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="ALL">{t("partner.orders.tabs.all")}</TabsTrigger>
          <TabsTrigger value="WAITING">
            {t("partner.orders.tabs.waiting")}
          </TabsTrigger>
          <TabsTrigger value="COLLECTED">
            {t("partner.orders.tabs.collected")}
          </TabsTrigger>
          <TabsTrigger value="PROCESSING">
            {t("partner.orders.tabs.processing")}
          </TabsTrigger>
          <TabsTrigger value="READY">
            {t("partner.orders.tabs.ready")}
          </TabsTrigger>
          <TabsTrigger value="RETURNED">
            {t("partner.orders.tabs.returned")}
          </TabsTrigger>
          <TabsTrigger value="COMPLETED">
            {t("partner.orders.tabs.completed")}
          </TabsTrigger>
        </TabsList>

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
        </Tabs>
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

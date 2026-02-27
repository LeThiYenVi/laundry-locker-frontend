import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { OrderTable } from "./components/OrderTable";
import { OrderFilters } from "./components/OrderFilters";
import { CreateOrderModal } from "./components/CreateOrderModal";
import { useOrders } from "./hooks/useOrders";
import { toast } from "sonner";

export default function OrdersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {
    orders,
    isLoading,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    statusCounts,
    addOrder,
  } = useOrders();

  const handleCreateOrder = (orderData: {
    customerName: string;
    customerPhone: string;
    type: string;
    items: { id: string; name: string; qty: number; price: number }[];
    notes: string;
  }) => {
    addOrder(orderData);
    toast.success("Đã tạo đơn hàng thành công");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý đơn hàng"
        description="Quản lý và theo dõi đơn hàng trong hệ thống"
        action={{
          label: "Tạo đơn hàng",
          onClick: () => setIsCreateModalOpen(true),
          icon: Plus,
        }}
      />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <OrderFilters
            status={status}
            onStatusChange={setStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusCounts={statusCounts}
          />

          <OrderTable orders={orders} isLoading={isLoading} />
        </CardContent>
      </Card>

      <CreateOrderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateOrder}
      />
    </div>
  );
}

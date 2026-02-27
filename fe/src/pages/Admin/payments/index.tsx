import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { PaymentTable } from "./components/PaymentTable";
import { PaymentFilters } from "./components/PaymentFilters";
import { PaymentStats } from "./components/PaymentStats";
import { usePayments } from "./hooks/usePayments";

export default function PaymentsPage() {
  const {
    payments,
    isLoading,
    statistics,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    statusCounts,
  } = usePayments();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý thanh toán"
        description="Quản lý và theo dõi các giao dịch thanh toán"
      />

      <PaymentStats statistics={statistics} />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <PaymentFilters
            status={status}
            onStatusChange={setStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusCounts={statusCounts}
          />

          <PaymentTable
            payments={payments}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}

import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { ServiceTable } from "./components/ServiceTable";
import { ServiceFilters } from "./components/ServiceFilters";
import { ServiceModal } from "./components/ServiceModal";
import { useServices } from "./hooks/useServices";

export default function ServicesPage() {
  const {
    services,
    isLoading,
    status,
    setStatus,
    searchQuery,
    setSearchQuery,
    statusCounts,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    selectedService,
    handleCreate,
    handleEdit,
    handleDelete,
    handleToggleStatus,
  } = useServices();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý dịch vụ"
        description="Quản lý các dịch vụ giặt ủi trong hệ thống"
      />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <ServiceFilters
            status={status}
            onStatusChange={setStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusCounts={statusCounts}
            onCreate={handleCreate}
          />

          <ServiceTable
            services={services}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </CardContent>
      </Card>

      <ServiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <ServiceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        service={selectedService}
        mode="edit"
      />
    </div>
  );
}

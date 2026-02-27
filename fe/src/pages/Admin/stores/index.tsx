import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { StoreTable } from "./components/StoreTable";
import { StoreFilters } from "./components/StoreFilters";
import { StoreModal } from "./components/StoreModal";
import { useStores } from "./hooks/useStores";

export default function StoresPage() {
  const {
    stores,
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
    selectedStore,
    handleCreate,
    handleEdit,
    handleDelete,
  } = useStores();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý cửa hàng"
        description="Quản lý các cửa hàng trong hệ thống"
      />

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <StoreFilters
            status={status}
            onStatusChange={setStatus}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusCounts={statusCounts}
            onCreate={handleCreate}
          />

          <StoreTable
            stores={stores}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <StoreModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        mode="create"
      />

      <StoreModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        store={selectedStore}
        mode="edit"
      />
    </div>
  );
}

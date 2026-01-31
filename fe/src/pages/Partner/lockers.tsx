import * as React from "react";
import { Boxes, MapPin, ChevronRight, Box } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  PageLoading,
  ErrorState,
  Badge,
} from "~/components/ui";
import { 
  useGetPartnerLockersQuery,
} from "@/stores/apis/partner";
import { BoxStatus, LockerStatus } from "@/schemas/partner.schemas";
import { t } from "@/lib/i18n";

const LOCKER_STATUS_COLORS: Record<LockerStatus | string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-700",
  MAINTENANCE: "bg-yellow-100 text-yellow-700",
  DISCONNECTED: "bg-red-100 text-red-700",
};

const BOX_STATUS_COLORS: Record<BoxStatus | string, string> = {
  AVAILABLE: "bg-green-100 text-green-700 border-green-300",
  OCCUPIED: "bg-red-100 text-red-700 border-red-300",
  RESERVED: "bg-yellow-100 text-yellow-700 border-yellow-300",
  MAINTENANCE: "bg-gray-100 text-gray-700 border-gray-300",
};

export default function PartnerLockersPage(): React.JSX.Element {
  const [selectedLockerId, setSelectedLockerId] = React.useState<number | null>(null);

  const { 
    data: lockersData, 
    isLoading, 
    error,
    refetch 
  } = useGetPartnerLockersQuery();

  const lockers = lockersData?.data || [];
  const selectedLocker = lockers.find(l => l.id === selectedLockerId);

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách locker..." />;
  }

  if (error) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải danh sách locker"
        error={error}
        onRetry={refetch}
        onClose={() => window.history.back()}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">{t("partner.lockers.title")}</h1>
        <p className="text-gray-600 mt-1">
          {lockers.length} locker · {lockers.reduce((acc, l) => acc + l.totalBoxes, 0)} boxes
        </p>
      </div>

      {/* Lockers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lockers.map((locker) => (
          <Card 
            key={locker.id}
            className={`cursor-pointer transition-all ${
              selectedLockerId === locker.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedLockerId(locker.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Boxes className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{locker.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span className="truncate max-w-[150px]">{locker.address}</span>
                    </div>
                  </div>
                </div>
                <Badge className={LOCKER_STATUS_COLORS[locker.status]}>
                  {t(`admin.lockers.status.${locker.status.toLowerCase()}`)}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold">{locker.totalBoxes}</p>
                  <p className="text-xs text-gray-600">{t("partner.lockers.total")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {locker.availableBoxes}
                  </p>
                  <p className="text-xs text-gray-600">{t("partner.lockers.available")}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {locker.totalBoxes - locker.availableBoxes}
                  </p>
                  <p className="text-xs text-gray-600">{t("partner.lockers.occupied")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Locker Detail */}
      {selectedLocker && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedLocker.name} - Chi tiết tủ đồ</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedLockerId(null)}
              >
                {t("partner.common.close")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {selectedLocker.boxes?.map((box) => (
                <div
                  key={box.id}
                  className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 ${
                    BOX_STATUS_COLORS[box.status]
                  }`}
                  title={`Box ${box.boxNumber} - ${box.status}`}
                >
                  <Box size={20} />
                  <span className="text-xs font-medium mt-1">{box.boxNumber}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                <span className="text-sm text-gray-600">{t("partner.lockers.availableBox")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
                <span className="text-sm text-gray-600">{t("partner.lockers.occupiedBox")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
                <span className="text-sm text-gray-600">{t("partner.lockers.reservedBox")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
                <span className="text-sm text-gray-600">{t("partner.lockers.maintenanceBox")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

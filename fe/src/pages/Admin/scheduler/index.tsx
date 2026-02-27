import { PageHeader } from "~/components/shared/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { useScheduler } from "./hooks/useScheduler";
import { SchedulerStatus } from "./components/SchedulerStatus";
import { JobCard } from "./components/JobCard";
import { JobResults } from "./components/JobResults";
import { PageLoading, ErrorState } from "~/components/ui";
import { Timer, Package, Bell } from "lucide-react";

export default function SchedulerPage() {
  const {
    isEnabled,
    activeJobs,
    schedulerStatus,
    isLoadingStatus,
    statusError,
    refetchStatus,
    handleTriggerAutoCancel,
    handleTriggerBoxRelease,
    handleTriggerPickupReminders,
    isTriggeringCancel,
    isTriggeringRelease,
    isTriggeringReminders,
    isLoading,
    jobResults,
  } = useScheduler();

  if (isLoadingStatus && !schedulerStatus) {
    return <PageLoading message="Đang tải trạng thái scheduler..." />;
  }

  if (statusError) {
    return (
      <ErrorState
        variant="server"
        title="Không thể tải trạng thái scheduler"
        error={statusError}
        onRetry={refetchStatus}
      />
    );
  }

  const jobs = [
    {
      title: "Auto-Cancel Orders",
      description:
        "Tự động hủy các đơn hàng INITIALIZED quá 30 phút không xác nhận. Giải phóng box và gửi notification cho khách.",
      frequency: "Mỗi 5 phút",
      icon: <Timer size={20} className="text-orange-600" />,
      onTrigger: handleTriggerAutoCancel,
      isLoading: isTriggeringCancel,
    },
    {
      title: "Release Boxes",
      description:
        "Giải phóng các box từ đơn hàng COMPLETED sau 5 phút. Xóa PIN code để đảm bảo bảo mật.",
      frequency: "Mỗi 2 phút",
      icon: <Package size={20} className="text-blue-600" />,
      onTrigger: handleTriggerBoxRelease,
      isLoading: isTriggeringRelease,
    },
    {
      title: "Pickup Reminders",
      description:
        'Gửi notification nhắc nhở khách đến lấy đồ cho các đơn hàng RETURNED quá 24 giờ.',
      frequency: "Mỗi 1 giờ",
      icon: <Bell size={20} className="text-purple-600" />,
      onTrigger: handleTriggerPickupReminders,
      isLoading: isTriggeringReminders,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Scheduler"
        description="Quản lý các tác vụ tự động và trigger thủ công"
      />

      {/* Status Card */}
      <SchedulerStatus
        isEnabled={isEnabled}
        activeJobs={activeJobs}
        isLoading={isLoadingStatus}
        onRefresh={refetchStatus}
      />

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard
            key={job.title}
            title={job.title}
            description={job.description}
            frequency={job.frequency}
            icon={job.icon}
            onTrigger={job.onTrigger}
            isLoading={job.isLoading}
          />
        ))}
      </div>

      {/* Results */}
      <JobResults results={jobResults} />

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Thông tin</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>
              Các scheduler job chạy tự động theo tần suất đã cấu hình
            </li>
            <li>
              Admin có thể trigger thủ công để test hoặc xử lý gấp
            </li>
            <li>
              Kết quả chạy job được lưu lại 10 lần gần nhất
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

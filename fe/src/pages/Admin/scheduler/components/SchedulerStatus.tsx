import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from "~/components/ui";
import {
  CheckCircle,
  XCircle,
  Activity,
  Timer,
  Package,
  Bell,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { useGetSchedulerStatusQuery } from "~/stores/apis/admin/scheduler";

// Map API job names to display metadata
const JOB_META: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  "auto-cancel-unconfirmed-orders": {
    label: "Auto-Cancel Orders",
    icon: Timer,
    color: "text-orange-600",
  },
  "release-boxes-after-completion": {
    label: "Release Boxes",
    icon: Package,
    color: "text-blue-600",
  },
  "send-pickup-reminders": {
    label: "Pickup Reminders",
    icon: Bell,
    color: "text-purple-600",
  },
};

const FREQ_META: Record<string, string> = {
  "auto-cancel-unconfirmed-orders": "Mỗi 5 phút",
  "release-boxes-after-completion": "Mỗi 2 phút",
  "send-pickup-reminders": "Mỗi 1 giờ",
};

export function SchedulerStatus() {
  const { data, isLoading, isError, refetch } = useGetSchedulerStatusQuery();
  const status = data?.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          Trạng thái Scheduler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* System status row */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="font-medium">Trạng thái hệ thống</span>
          {isLoading ? (
            <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100">
              <Loader2 size={14} className="mr-1 animate-spin" />
              Đang tải...
            </Badge>
          ) : isError ? (
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                <XCircle size={14} className="mr-1" />
                Không thể kết nối
              </Badge>
              <button
                onClick={refetch}
                className="text-gray-400 hover:text-gray-700"
                title="Thử lại"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          ) : status?.schedulerEnabled ? (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              <CheckCircle size={14} className="mr-1" />
              Đang hoạt động
            </Badge>
          ) : (
            <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
              <XCircle size={14} className="mr-1" />
              Đã tắt
            </Badge>
          )}
        </div>

        {/* API message */}
        {status?.message && (
          <p className="text-xs text-gray-500 px-1">{status.message}</p>
        )}

        {/* Job list */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">
            Các job tự động
          </h4>
          <div className="space-y-2">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg animate-pulse"
                >
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                </div>
              ))
            ) : isError || !status?.jobs?.length ? (
              Object.entries(JOB_META).map(([key, meta]) => {
                const Icon = meta.icon;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg opacity-60"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={meta.color} />
                      <span className="text-sm font-medium">{meta.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {FREQ_META[key]}
                    </Badge>
                  </div>
                );
              })
            ) : (
              status.jobs.map((jobKey) => {
                const meta = JOB_META[jobKey] ?? {
                  label: jobKey,
                  icon: Activity,
                  color: "text-gray-600",
                };
                const Icon = meta.icon;
                return (
                  <div
                    key={jobKey}
                    className="flex items-center justify-between p-3 bg-white border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Icon size={16} className={meta.color} />
                      <span className="text-sm font-medium">{meta.label}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs text-green-700 border-green-300 bg-green-50"
                    >
                      ● {FREQ_META[jobKey] ?? "Tự động"}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

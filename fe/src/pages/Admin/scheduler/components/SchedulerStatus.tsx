import { Card, CardContent, CardHeader, CardTitle, Badge } from "~/components/ui";
import { CheckCircle, XCircle, Activity, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";

interface SchedulerStatusProps {
  isEnabled: boolean;
  activeJobs: string[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function SchedulerStatus({ isEnabled, activeJobs, isLoading, onRefresh }: SchedulerStatusProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity size={20} className="text-blue-600" />
          Trạng thái Scheduler
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw size={16} className={`mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="font-medium">Trạng thái hệ thống</span>
          <Badge
            variant={isEnabled ? "default" : "destructive"}
            className={isEnabled ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
          >
            {isEnabled ? (
              <>
                <CheckCircle size={14} className="mr-1" />
                Đang hoạt động
              </>
            ) : (
              <>
                <XCircle size={14} className="mr-1" />
                Tạm dừng
              </>
            )}
          </Badge>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-3">Các job đang chạy</h4>
          {activeJobs.length === 0 ? (
            <p className="text-sm text-gray-400 italic">Không có job nào đang chạy</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activeJobs.map((job) => (
                <Badge key={job} variant="outline" className="bg-blue-50">
                  {job}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

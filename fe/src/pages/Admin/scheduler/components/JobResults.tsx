import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import type { JobResult } from "../hooks/useScheduler";

interface JobResultsProps {
  results: JobResult[];
}

export function JobResults({ results }: JobResultsProps) {
  if (results.length === 0) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="p-8 text-center text-gray-500">
          <Clock size={32} className="mx-auto mb-2 text-gray-400" />
          <p>Chưa có job nào được chạy</p>
          <p className="text-sm text-gray-400">Các kết quả sẽ hiển thị ở đây</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lịch sử chạy job</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {results.map((result, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                result.success ? "bg-green-50" : "bg-red-50"
              }`}
            >
              {result.success ? (
                <CheckCircle size={18} className="text-green-600 mt-0.5" />
              ) : (
                <XCircle size={18} className="text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{result.jobName}</span>
                  <span className="text-xs text-gray-500">
                    {result.timestamp.toLocaleTimeString("vi-VN")}
                  </span>
                </div>
                <p
                  className={`text-sm ${
                    result.success ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {result.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

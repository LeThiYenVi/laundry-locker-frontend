import { Card, CardContent, CardHeader, CardTitle, Button } from "~/components/ui";
import { Play, Clock, AlertCircle } from "lucide-react";

interface JobCardProps {
  title: string;
  description: string;
  frequency: string;
  icon: React.ReactNode;
  onTrigger: () => void;
  isLoading: boolean;
  lastRun?: string;
}

export function JobCard({
  title,
  description,
  frequency,
  icon,
  onTrigger,
  isLoading,
  lastRun,
}: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-blue-100 rounded-lg">{icon}</div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{description}</p>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock size={14} />
          <span>Tần suất: {frequency}</span>
        </div>

        {lastRun && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle size={14} />
            <span>Chạy gần nhất: {lastRun}</span>
          </div>
        )}

        <Button
          onClick={onTrigger}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          <Play size={16} className="mr-2" />
          {isLoading ? "Đang chạy..." : "Chạy ngay"}
        </Button>
      </CardContent>
    </Card>
  );
}

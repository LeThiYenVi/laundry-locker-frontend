import { Card, CardContent } from "~/components/ui/card";

interface OverviewCardProps {
  label: string;
  value: string;
}

export function OverviewCard({ label, value }: OverviewCardProps) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-blue-900 to-blue-800 border-0 shadow-lg">
      <CardContent className="p-5 sm:p-6">
        <p className="text-xs sm:text-sm text-blue-200 uppercase tracking-wider font-medium mb-2">
          {label}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

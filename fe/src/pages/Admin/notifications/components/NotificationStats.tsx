import {
  Bell,
  CheckCheck,
  Archive,
  TrendingUp,
  Mail,
  Smartphone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "~/components/ui/card";
import type { NotificationStatsResponse } from "~/types/admin/notification";

interface NotificationStatsProps {
  stats?: NotificationStatsResponse;
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  description?: string;
  isLoading: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  description,
  isLoading,
}: StatCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>
            <Icon size={18} className={iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium truncate">
              {title}
            </p>
            {isLoading ? (
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mt-1" />
            ) : (
              <p className="text-xl font-bold text-gray-900">{value}</p>
            )}
            {description && (
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationStats({
  stats,
  isLoading,
}: NotificationStatsProps) {
  const { t } = useTranslation();
  const deliveryRate =
    stats?.deliveryRate != null
      ? `${(stats.deliveryRate * 100).toFixed(1)}%`
      : "—";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      <StatCard
        title={t("admin.notifications.stats.total")}
        value={stats?.totalNotifications ?? 0}
        icon={Bell}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        isLoading={isLoading}
      />
      <StatCard
        title={t("admin.notifications.stats.unread")}
        value={stats?.unreadCount ?? 0}
        icon={Bell}
        iconBg="bg-orange-50"
        iconColor="text-orange-600"
        isLoading={isLoading}
      />
      <StatCard
        title={t("admin.notifications.stats.read")}
        value={stats?.readCount ?? 0}
        icon={CheckCheck}
        iconBg="bg-green-50"
        iconColor="text-green-600"
        isLoading={isLoading}
      />
      <StatCard
        title={t("admin.notifications.stats.archived")}
        value={stats?.archivedCount ?? 0}
        icon={Archive}
        iconBg="bg-gray-50"
        iconColor="text-gray-600"
        isLoading={isLoading}
      />
      <StatCard
        title={t("admin.notifications.stats.deliveryRate")}
        value={deliveryRate}
        icon={TrendingUp}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        isLoading={isLoading}
      />
      <StatCard
        title={t("admin.notifications.stats.avgReadTime")}
        value={
          stats?.averageReadTime != null ? `${stats.averageReadTime}m` : "—"
        }
        icon={Mail}
        iconBg="bg-purple-50"
        iconColor="text-purple-600"
        description={t("admin.notifications.stats.minutes")}
        isLoading={isLoading}
      />
    </div>
  );
}

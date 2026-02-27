import { Package, TrendingUp, DollarSign, Boxes } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, Badge } from "~/components/ui";
import type { DashboardStats } from "../hooks/useDashboard";

interface StatCardsProps {
  stats: DashboardStats;
}

export function StatCards({ stats }: StatCardsProps) {
  const { t } = useTranslation();

  const statsConfig = [
    {
      key: "todayOrders" as const,
      label: t("partner.dashboard.stats.todayOrders"),
      subLabel: t("partner.dashboard.stats.total"),
      icon: Package,
      color: "blue",
      gradient: "from-blue-100 to-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-600",
      format: (v: number) => v.toString(),
    },
    {
      key: "processingOrders" as const,
      label: t("partner.dashboard.stats.processing"),
      subLabel: t("partner.dashboard.stats.processingShort"),
      icon: TrendingUp,
      color: "orange",
      gradient: "from-orange-100 to-orange-50",
      borderColor: "border-orange-200",
      iconColor: "text-orange-600",
      format: (v: number) => v.toString(),
    },
    {
      key: "monthlyRevenue" as const,
      label: t("partner.dashboard.stats.revenue"),
      subLabel: t("partner.dashboard.stats.thisMonth"),
      icon: DollarSign,
      color: "green",
      gradient: "from-green-100 to-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-600",
      format: (v: number) => `${(v / 1000000).toFixed(1)}M`,
      extra: (stats: DashboardStats) =>
        `${t("partner.dashboard.stats.earnings")}: ${(stats.partnerRevenue / 1000000).toFixed(1)}M`,
    },
    {
      key: "activeLockers" as const,
      label: t("partner.dashboard.stats.stores"),
      subLabel: t("partner.dashboard.stats.active"),
      icon: Boxes,
      color: "purple",
      gradient: "from-purple-100 to-purple-50",
      borderColor: "border-purple-200",
      iconColor: "text-purple-600",
      format: (v: number) => v.toString(),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsConfig.map((config) => {
        const Icon = config.icon;
        const value = stats[config.key];

        return (
          <Card
            key={config.key}
            className={`bg-gradient-to-br ${config.gradient} rounded-3xl p-6 border ${config.borderColor}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white rounded-xl">
                <Icon className={config.iconColor} size={24} />
              </div>
              <Badge className={`bg-${config.color}-600 text-white`}>
                {config.subLabel}
              </Badge>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {config.label}
            </h3>
            <p className={`text-3xl font-bold text-${config.color}-600`}>
              {config.format(value as number)}
            </p>
            {config.extra && (
              <p className="text-sm text-gray-600 mt-1">{config.extra(stats)}</p>
            )}
          </Card>
        );
      })}
    </div>
  );
}

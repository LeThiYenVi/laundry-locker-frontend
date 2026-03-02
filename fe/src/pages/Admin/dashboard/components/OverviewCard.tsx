import { Card, CardContent } from "~/components/ui/card";

const colorMap = {
  blue: {
    bg: "from-blue-600 to-blue-700",
    label: "text-blue-100",
    iconBg: "bg-blue-500/30",
  },
  indigo: {
    bg: "from-indigo-600 to-indigo-700",
    label: "text-indigo-100",
    iconBg: "bg-indigo-500/30",
  },
  emerald: {
    bg: "from-emerald-600 to-emerald-700",
    label: "text-emerald-100",
    iconBg: "bg-emerald-500/30",
  },
  green: {
    bg: "from-green-500 to-green-600",
    label: "text-green-100",
    iconBg: "bg-green-500/30",
  },
  amber: {
    bg: "from-amber-500 to-amber-600",
    label: "text-amber-100",
    iconBg: "bg-amber-500/30",
  },
  red: {
    bg: "from-red-500 to-red-600",
    label: "text-red-100",
    iconBg: "bg-red-500/30",
  },
  purple: {
    bg: "from-purple-600 to-purple-700",
    label: "text-purple-100",
    iconBg: "bg-purple-500/30",
  },
  gray: {
    bg: "from-gray-600 to-gray-700",
    label: "text-gray-100",
    iconBg: "bg-gray-500/30",
  },
} as const;

interface OverviewCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  sublabel?: string;
  color?: keyof typeof colorMap;
}

export function OverviewCard({
  label,
  value,
  icon: Icon,
  sublabel,
  color = "blue",
}: OverviewCardProps) {
  const c = colorMap[color];
  return (
    <Card
      className={`overflow-hidden bg-gradient-to-br ${c.bg} border-0 shadow-md`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p
              className={`text-xs font-medium uppercase tracking-wider mb-2 ${c.label}`}
            >
              {label}
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
            {sublabel && (
              <p className={`text-xs mt-1 ${c.label} opacity-75`}>{sublabel}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-xl ${c.iconBg} shrink-0`}>
            <Icon size={22} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

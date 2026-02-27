import { cn } from "~/lib/utils";

interface StatusTab {
  value: string;
  label: string;
  count?: number;
  color?: "blue" | "green" | "yellow" | "red" | "gray" | "purple";
}

interface StatusTabsProps {
  tabs: StatusTab[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

const colorVariants = {
  blue: "bg-blue-100 text-blue-700 border-blue-200 data-[active=true]:bg-blue-600 data-[active=true]:text-white",
  green: "bg-green-100 text-green-700 border-green-200 data-[active=true]:bg-green-600 data-[active=true]:text-white",
  yellow: "bg-yellow-100 text-yellow-700 border-yellow-200 data-[active=true]:bg-yellow-600 data-[active=true]:text-white",
  red: "bg-red-100 text-red-700 border-red-200 data-[active=true]:bg-red-600 data-[active=true]:text-white",
  gray: "bg-gray-100 text-gray-700 border-gray-200 data-[active=true]:bg-gray-600 data-[active=true]:text-white",
  purple: "bg-purple-100 text-purple-700 border-purple-200 data-[active=true]:bg-purple-600 data-[active=true]:text-white",
};

export function StatusTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
}: StatusTabsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onTabChange(tab.value)}
          data-active={activeTab === tab.value}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200",
            "hover:shadow-md hover:-translate-y-0.5",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
            colorVariants[tab.color || "blue"],
            activeTab === tab.value && "shadow-md -translate-y-0.5"
          )}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={cn(
                "ml-2 px-2 py-0.5 rounded-full text-xs font-semibold",
                activeTab === tab.value
                  ? "bg-white/20 text-white"
                  : "bg-current/20 text-current"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

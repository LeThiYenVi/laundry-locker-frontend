import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Plus } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<{ size?: number }>;
  };
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  const Icon = action?.icon || Plus;

  return (
    <div className={cn("flex items-start justify-between mb-6", className)}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>

      {action && (
        <Button
          onClick={action.onClick}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Icon size={18} />
          <span className="ml-2">{action.label}</span>
        </Button>
      )}
    </div>
  );
}

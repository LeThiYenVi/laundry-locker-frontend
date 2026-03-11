import {
  CheckCircle2,
  Circle,
  Clock,
  Package,
  Truck,
  RotateCcw,
  Box,
  XCircle,
} from "lucide-react";
import { OrderStatus } from "~/types/admin/enums";

interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

interface Order {
  status: OrderStatus;
  createdAt?: string;
  timeline?: OrderTimelineEvent[];
}

interface OrderTimelineProps {
  order: Order;
}

const statusOrder = [
  OrderStatus.INITIALIZED,
  OrderStatus.RESERVED,
  OrderStatus.WAITING,
  OrderStatus.COLLECTED,
  OrderStatus.PROCESSING,
  OrderStatus.READY,
  OrderStatus.RETURNED,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELED,
];

const statusConfig: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; description: string }
> = {
  [OrderStatus.INITIALIZED]: {
    label: "Khởi tạo",
    icon: Clock,
    description: "Đơn hàng được tạo",
  },
  [OrderStatus.RESERVED]: {
    label: "Đã đặt",
    icon: Package,
    description: "Đã đặt chỗ",
  },
  [OrderStatus.WAITING]: {
    label: "Chờ thu gom",
    icon: Truck,
    description: "Chờ staff đến thu gom",
  },
  [OrderStatus.COLLECTED]: {
    label: "Đã thu gom",
    icon: CheckCircle2,
    description: "Staff đã lấy đồ từ tủ",
  },
  [OrderStatus.PROCESSING]: {
    label: "Đang xử lý",
    icon: RotateCcw,
    description: "Đang giặt/ủi/xử lý",
  },
  [OrderStatus.READY]: {
    label: "Sẵn sàng",
    icon: CheckCircle2,
    description: "Đã giặt xong, chờ trả",
  },
  [OrderStatus.RETURNED]: {
    label: "Đã trả",
    icon: Box,
    description: "Đã trả đồ vào tủ",
  },
  [OrderStatus.COMPLETED]: {
    label: "Hoàn thành",
    icon: CheckCircle2,
    description: "Khách đã lấy đồ",
  },
  [OrderStatus.CANCELED]: {
    label: "Đã hủy",
    icon: XCircle,
    description: "Đơn hàng bị hủy",
  },
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function OrderTimeline({ order }: OrderTimelineProps) {
  const timeline = order.timeline || [];
  
  // Build timeline from events or generate from current status
  const getTimelineEvents = (): OrderTimelineEvent[] => {
    if (timeline.length > 0) {
      return timeline;
    }
    
    // Generate basic timeline from status
    const events: OrderTimelineEvent[] = [
      { status: OrderStatus.INITIALIZED, timestamp: order.createdAt },
    ];
    
    const currentIndex = statusOrder.indexOf(order.status);
    if (currentIndex > 0) {
      for (let i = 1; i <= currentIndex; i++) {
        events.push({
          status: statusOrder[i],
          timestamp: order.createdAt, // Placeholder
        });
      }
    }
    
    return events;
  };

  const events = getTimelineEvents();
  const isCanceled = order.status === OrderStatus.CANCELED;

  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const config = statusConfig[event.status];
        const Icon = config.icon;
        const isLast = index === events.length - 1;
        const isActive = index === events.length - 1 && !isCanceled;

        return (
          <div key={index} className="flex gap-4">
            {/* Timeline line and icon */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : isCanceled && isLast
                    ? "bg-red-100 text-red-600"
                    : "bg-muted/50 text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              {!isLast && (
                <div className="w-0.5 h-full bg-muted my-2" />
              )}
            </div>

            {/* Content */}
            <div className={`pb-8 ${isLast ? "" : ""}`}>
              <div className="flex items-center gap-2">
                <h4
                  className={`font-medium ${
                    isActive
                      ? "text-blue-600"
                      : isCanceled && isLast
                      ? "text-red-600"
                      : "text-foreground"
                  }`}
                >
                  {config.label}
                </h4>
                {isActive && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    Hiện tại
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{config.description}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {formatDate(event.timestamp)}
              </p>
              {event.note && (
                <p className="text-sm text-muted-foreground mt-1 italic">
                  "{event.note}"
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Future steps (if not canceled) */}
      {!isCanceled && order.status !== OrderStatus.COMPLETED && (
        <>
          {statusOrder
            .slice(statusOrder.indexOf(order.status) + 1)
            .map((status, index) => {
              const config = statusConfig[status];
              const Icon = config.icon;
              const isLastFuture =
                index ===
                statusOrder.slice(statusOrder.indexOf(order.status) + 1).length -
                  1;

              return (
                <div key={`future-${index}`} className="flex gap-4 opacity-50">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-muted/50 text-muted-foreground/70 flex items-center justify-center border-2 border-dashed border-border/70">
                      <Icon className="h-5 w-5" />
                    </div>
                    {!isLastFuture && (
                      <div className="w-0.5 h-full bg-muted my-2" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h4 className="font-medium text-muted-foreground/70">{config.label}</h4>
                    <p className="text-sm text-muted-foreground/70">{config.description}</p>
                  </div>
                </div>
              );
            })}
        </>
      )}
    </div>
  );
}

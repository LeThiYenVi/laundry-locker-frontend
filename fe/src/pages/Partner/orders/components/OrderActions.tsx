import { Check, Play, CheckCircle, Scale, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button, Badge } from "~/components/ui";
import type { PartnerOrder } from "@/types/partner.type";
import { OrderStatus } from "@/types/partner.enum";

interface OrderActionsProps {
  order: PartnerOrder;
  onAcceptOrder: (order: PartnerOrder) => void;
  onOpenWeightModal: (order: PartnerOrder) => void;
  onProcessOrder: (order: PartnerOrder) => void;
  onMarkReady: (order: PartnerOrder) => void;
  isAccepting: boolean;
  isProcessing: boolean;
  isMarkingReady: boolean;
}

export function OrderActions({
  order,
  onAcceptOrder,
  onOpenWeightModal,
  onProcessOrder,
  onMarkReady,
  isAccepting,
  isProcessing,
  isMarkingReady,
}: OrderActionsProps) {
  const { t } = useTranslation();

  switch (order.status) {
    case OrderStatus.WAITING:
      return (
        <Button
          size="sm"
          onClick={() => onAcceptOrder(order)}
          disabled={isAccepting}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check size={14} className="mr-1" />
          {t("partner.orders.actions.accept")}
        </Button>
      );

    case OrderStatus.COLLECTED:
      return (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onOpenWeightModal(order)}>
            <Scale size={14} className="mr-1" />
            {t("partner.orders.actions.enterWeight")}
          </Button>
          <Button
            size="sm"
            onClick={() => onProcessOrder(order)}
            disabled={isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play size={14} className="mr-1" />
            {t("partner.orders.actions.process")}
          </Button>
        </div>
      );

    case OrderStatus.PROCESSING:
    case OrderStatus.PROCESSED:
      return (
        <Button
          size="sm"
          onClick={() => onMarkReady(order)}
          disabled={isMarkingReady}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <CheckCircle size={14} className="mr-1" />
          {t("partner.orders.actions.markReady")}
        </Button>
      );

    case OrderStatus.READY:
      return (
        <Badge variant="outline" className="text-purple-600 border-purple-600">
          {t("partner.orders.status.waitingReturn")}
        </Badge>
      );

    case OrderStatus.RETURNED:
      return (
        <Badge variant="outline" className="text-green-600 border-green-600">
          {t("partner.orders.status.waitingPickup")}
        </Badge>
      );

    case OrderStatus.COMPLETED:
      return (
        <Button size="sm" variant="ghost">
          <Eye size={14} className="mr-1" />
          {t("button.detail")}
        </Button>
      );

    default:
      return null;
  }
}

import { type ReactNode, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  Box as BoxIcon,
  CheckCircle2,
  Plane,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Wrench,
  Luggage,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import {
  useGetLockerLayoutQuery,
  useReportBoxFaultMutation,
  useClearBoxFaultMutation,
  useSetBoxOutOfServiceMutation,
  useSetBoxCleaningMutation,
  useReturnBoxToServiceMutation,
  type CellResponse,
} from "~/stores/apis/admin/lockerOps";

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  AVAILABLE: { label: "Trống", cls: "bg-green-50 border-green-300 text-green-800" },
  RESERVED: { label: "Đã giữ chỗ", cls: "bg-blue-50 border-blue-300 text-blue-800" },
  OCCUPIED: { label: "Có đồ", cls: "bg-orange-50 border-orange-300 text-orange-800" },
  FAULT: { label: "Hỏng", cls: "bg-red-50 border-red-400 text-red-800" },
  OUT_OF_SERVICE: { label: "Ngưng dùng", cls: "bg-slate-100 border-slate-400 text-slate-700" },
  CLEANING: { label: "Đang vệ sinh", cls: "bg-cyan-50 border-cyan-300 text-cyan-800" },
};

function ActBtn({
  icon,
  label,
  onClick,
  busy,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  busy: boolean;
}) {
  return (
    <Button
      size="sm"
      variant="outline"
      className="h-6 px-2 text-[11px]"
      disabled={busy}
      onClick={onClick}
    >
      {icon} {label}
    </Button>
  );
}

function CellTile({
  cell,
  onFault,
  onClear,
  onOutOfService,
  onCleaning,
  onReturn,
  busy,
}: {
  cell: CellResponse;
  onFault: (cell: CellResponse) => void;
  onClear: (cell: CellResponse) => void;
  onOutOfService: (cell: CellResponse) => void;
  onCleaning: (cell: CellResponse) => void;
  onReturn: (cell: CellResponse) => void;
  busy: boolean;
}) {
  const style = STATUS_STYLE[cell.status] ?? {
    label: cell.status,
    cls: "bg-muted border-border text-foreground",
  };
  return (
    <div
      className={`rounded-lg border-2 p-3 flex flex-col gap-1 min-h-28 ${style.cls}`}
      title={cell.faultReason ?? undefined}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">Ô #{cell.boxNumber}</span>
        {cell.cellType === "DRONE" && <Plane className="w-4 h-4" />}
        {cell.cellType === "XL" && <Luggage className="w-4 h-4" />}
        {cell.cellType === "STANDARD" && <BoxIcon className="w-4 h-4" />}
      </div>
      <span className="text-xs">{style.label}</span>
      {cell.faultReason && (
        <span className="text-[11px] leading-tight line-clamp-2">{cell.faultReason}</span>
      )}
      <div className="mt-auto flex flex-wrap gap-1">
        {cell.status === "FAULT" ? (
          <ActBtn
            icon={<CheckCircle2 className="w-3 h-3 mr-1" />}
            label="Đã sửa"
            busy={busy}
            onClick={() => onClear(cell)}
          />
        ) : cell.status === "OUT_OF_SERVICE" || cell.status === "CLEANING" ? (
          <ActBtn
            icon={<RotateCcw className="w-3 h-3 mr-1" />}
            label="Khôi phục"
            busy={busy}
            onClick={() => onReturn(cell)}
          />
        ) : cell.status === "OCCUPIED" || cell.status === "RESERVED" ? (
          <ActBtn
            icon={<Wrench className="w-3 h-3 mr-1" />}
            label="Báo hỏng"
            busy={busy}
            onClick={() => onFault(cell)}
          />
        ) : (
          <>
            <ActBtn
              icon={<Wrench className="w-3 h-3 mr-1" />}
              label="Hỏng"
              busy={busy}
              onClick={() => onFault(cell)}
            />
            <ActBtn
              icon={<Ban className="w-3 h-3 mr-1" />}
              label="Ngưng"
              busy={busy}
              onClick={() => onOutOfService(cell)}
            />
            <ActBtn
              icon={<Sparkles className="w-3 h-3 mr-1" />}
              label="Vệ sinh"
              busy={busy}
              onClick={() => onCleaning(cell)}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function LockerLayoutPage() {
  const { lockerId } = useParams();
  const navigate = useNavigate();
  const id = Number(lockerId);
  const { data, isLoading, isFetching, refetch } = useGetLockerLayoutQuery(id, {
    skip: !Number.isFinite(id),
    pollingInterval: 15000,
  });
  const [reportFault, { isLoading: faulting }] = useReportBoxFaultMutation();
  const [clearFault, { isLoading: clearing }] = useClearBoxFaultMutation();
  const [outOfService, { isLoading: oosing }] = useSetBoxOutOfServiceMutation();
  const [cleaning, { isLoading: cleaningBusy }] = useSetBoxCleaningMutation();
  const [returnToService, { isLoading: returning }] = useReturnBoxToServiceMutation();
  const [pendingBox, setPendingBox] = useState<number | null>(null);

  const layout = data?.data;

  const rows = useMemo(() => {
    if (!layout) return [];
    const byRow = new Map<number, CellResponse[]>();
    for (const cell of layout.cells) {
      const row = cell.rowIndex ?? 0;
      if (!byRow.has(row)) byRow.set(row, []);
      byRow.get(row)!.push(cell);
    }
    return [...byRow.entries()]
      .sort(([a], [b]) => a - b)
      .map(([row, cells]) => ({
        row,
        cells: cells.sort((a, b) => (a.colIndex ?? 0) - (b.colIndex ?? 0)),
      }));
  }, [layout]);

  const handleFault = async (cell: CellResponse) => {
    const reason = window.prompt(`Lý do báo hỏng ô #${cell.boxNumber}?`, "Khóa không mở");
    if (reason === null) return;
    setPendingBox(cell.id);
    try {
      await reportFault({ boxId: cell.id, reason }).unwrap();
      toast.success(`Đã báo hỏng ô #${cell.boxNumber}`);
    } catch {
      toast.error("Báo hỏng thất bại");
    } finally {
      setPendingBox(null);
    }
  };

  const handleClear = async (cell: CellResponse) => {
    setPendingBox(cell.id);
    try {
      await clearFault(cell.id).unwrap();
      toast.success(`Ô #${cell.boxNumber} đã hoạt động lại`);
    } catch {
      toast.error("Không xóa được trạng thái hỏng");
    } finally {
      setPendingBox(null);
    }
  };

  const handleOutOfService = async (cell: CellResponse) => {
    const reason = window.prompt(
      `Lý do ngưng dùng ô #${cell.boxNumber}? (để trống nếu không có)`,
      "",
    );
    if (reason === null) return;
    setPendingBox(cell.id);
    try {
      await outOfService({ boxId: cell.id, reason: reason.trim() || undefined }).unwrap();
      toast.success(`Đã ngưng dùng ô #${cell.boxNumber}`);
    } catch {
      toast.error("Không ngưng dùng được ô (ô đang có đơn?)");
    } finally {
      setPendingBox(null);
    }
  };

  const handleCleaning = async (cell: CellResponse) => {
    setPendingBox(cell.id);
    try {
      await cleaning(cell.id).unwrap();
      toast.success(`Ô #${cell.boxNumber} đang vệ sinh`);
    } catch {
      toast.error("Không đánh dấu vệ sinh được (ô đang có đơn?)");
    } finally {
      setPendingBox(null);
    }
  };

  const handleReturn = async (cell: CellResponse) => {
    setPendingBox(cell.id);
    try {
      await returnToService(cell.id).unwrap();
      toast.success(`Ô #${cell.boxNumber} đã hoạt động lại`);
    } catch {
      toast.error("Không khôi phục được ô");
    } finally {
      setPendingBox(null);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Đang tải sơ đồ tủ...</div>;
  }
  if (!layout) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Không tìm thấy tủ #{lockerId}</p>
        <Button variant="outline" onClick={() => navigate("/admin/lockers")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/lockers")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">
              {layout.name} <span className="text-muted-foreground">({layout.code})</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{layout.status}</Badge>
              {layout.landingPad && (
                <Badge className="bg-violet-100 text-violet-800 border-violet-300">
                  <Plane className="w-3 h-3 mr-1" />
                  Bãi đáp drone {layout.landingMarkerId ? `· ${layout.landingMarkerId}` : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? "animate-spin" : ""}`} /> Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Tổng số ô</p>
            <p className="text-2xl font-bold">{layout.totalCells}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ô trống</p>
            <p className="text-2xl font-bold text-green-600">{layout.availableCells}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Đang dùng</p>
            <p className="text-2xl font-bold text-orange-600">
              {layout.totalCells - layout.availableCells - layout.faultCells}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Ô hỏng</p>
            <p className="text-2xl font-bold text-red-600">{layout.faultCells}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Sơ đồ vật lý (hàng 1 trên cùng — ô DRONE chỉ nhận hàng từ drone)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.map(({ row, cells }) => (
            <div key={row} className="flex items-stretch gap-3">
              <div className="w-14 shrink-0 flex items-center justify-center text-xs text-muted-foreground border rounded-md bg-muted/40">
                Hàng {row}
              </div>
              <div
                className="grid gap-3 flex-1"
                style={{ gridTemplateColumns: `repeat(${Math.max(cells.length, 1)}, minmax(0, 1fr))` }}
              >
                {cells.map((cell) => (
                  <CellTile
                    key={cell.id}
                    cell={cell}
                    onFault={handleFault}
                    onClear={handleClear}
                    onOutOfService={handleOutOfService}
                    onCleaning={handleCleaning}
                    onReturn={handleReturn}
                    busy={
                      (faulting || clearing || oosing || cleaningBusy || returning) &&
                      pendingBox === cell.id
                    }
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-3 pt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Plane className="w-3 h-3" /> Ô nhận hàng drone</span>
            <span className="inline-flex items-center gap-1"><Luggage className="w-3 h-3" /> Ô vali (XL)</span>
            <span className="inline-flex items-center gap-1"><BoxIcon className="w-3 h-3" /> Ô thường</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

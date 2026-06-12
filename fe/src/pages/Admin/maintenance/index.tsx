import { useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, UserCheck, Wrench } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { toast } from "sonner";
import { PageHeader } from "~/components/shared/page-header";
import {
  useGetFaultCellsQuery,
  useGetMaintenanceReportsQuery,
  useClaimReportMutation,
  useResolveReportMutation,
  useClearBoxFaultMutation,
} from "~/stores/apis/admin/lockerOps";

const REPORT_BADGE: Record<string, string> = {
  OPEN: "bg-red-100 text-red-800 border-red-300",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 border-yellow-300",
  RESOLVED: "bg-green-100 text-green-800 border-green-300",
};

export default function MaintenancePage() {
  const faults = useGetFaultCellsQuery();
  const reports = useGetMaintenanceReportsQuery();
  const [claim] = useClaimReportMutation();
  const [resolve] = useResolveReportMutation();
  const [clearFault] = useClearBoxFaultMutation();
  const [pending, setPending] = useState<number | null>(null);

  const act = async (id: number, fn: () => Promise<unknown>, ok: string, fail: string) => {
    setPending(id);
    try {
      await fn();
      toast.success(ok);
    } catch {
      toast.error(fail);
    } finally {
      setPending(null);
    }
  };

  const faultList = faults.data?.data ?? [];
  const reportList = reports.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bảo trì tủ"
        description="Sự cố ô tủ đang mở và phiếu xử lý của đội kỹ thuật"
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Ô đang hỏng ({faultList.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              faults.refetch();
              reports.refetch();
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
          </Button>
        </CardHeader>
        <CardContent>
          {faultList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Không có ô nào đang hỏng 🎉
            </p>
          ) : (
            <div className="divide-y">
              {faultList.map((f) => (
                <div key={f.boxId} className="py-3 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium">
                      {f.lockerName ?? `Tủ #${f.lockerId}`}{" "}
                      <span className="text-muted-foreground">({f.lockerCode})</span> — Ô #{f.boxNumber}
                      <Badge variant="outline" className="ml-2">{f.cellType}</Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {f.faultReason ?? "Không rõ lý do"}
                      {f.rowIndex != null && ` · hàng ${f.rowIndex}, cột ${f.colIndex}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending === f.boxId}
                    onClick={() =>
                      act(
                        f.boxId,
                        () => clearFault(f.boxId).unwrap(),
                        `Ô #${f.boxNumber} đã hoạt động lại`,
                        "Không xóa được trạng thái hỏng",
                      )
                    }
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Đã sửa xong
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Phiếu sự cố đang mở ({reportList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reportList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Không có phiếu nào.</p>
          ) : (
            <div className="divide-y">
              {reportList.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-medium">
                      #{r.id} · {r.title}{" "}
                      <Badge className={`ml-1 ${REPORT_BADGE[r.status] ?? ""}`} variant="outline">
                        {r.status}
                      </Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {r.description} · tủ {r.lockerId}
                      {r.boxId ? ` · ô ${r.boxId}` : ""} ·{" "}
                      {new Date(r.createdAt).toLocaleString("vi-VN")}
                      {r.assignedToUserId ? ` · KTV #${r.assignedToUserId}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {r.status === "OPEN" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending === r.id}
                        onClick={() =>
                          act(
                            r.id,
                            () => claim(r.id).unwrap(),
                            `Đã nhận phiếu #${r.id}`,
                            "Không nhận được phiếu",
                          )
                        }
                      >
                        <UserCheck className="w-4 h-4 mr-1" /> Nhận việc
                      </Button>
                    )}
                    {r.status !== "RESOLVED" && (
                      <Button
                        size="sm"
                        disabled={pending === r.id}
                        onClick={() =>
                          act(
                            r.id,
                            () => resolve(r.id).unwrap(),
                            `Phiếu #${r.id} đã xử lý, ô hoạt động lại`,
                            "Không xử lý được phiếu",
                          )
                        }
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Hoàn tất
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import * as React from "react";
import { Card, CardContent } from "~/components/ui";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui";
import { t } from "@/lib/i18n";
import { sampleOrders as mockOrders } from "@/mockdata/orders.mock";
import { Clock, CheckCircle, Loader2, CheckSquare, MoreHorizontal } from "lucide-react";
import StatusCard from "~/components/ui/status-card";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "~/components/ui/pagination";

const tableHeader = {
  bg: "bg-blue-950",
  text: "text-amber-100",
};

function countByStatus(list: { status: string }[], key: string) {
  return list.filter((o) => {
    const s = o.status.toLowerCase();
    if (key === "waiting") return s.includes("wait");
    if (key === "confirmed") return s.includes("confirm");
    if (key === "inprogress") return s.includes("process") || s.includes("progress") || s.includes("in progress");
    if (key === "done") return s.includes("deliver") || s.includes("done") || s.includes("completed");
    return false;
  }).length;
}

export default function OrdersPage(): React.JSX.Element {
  const [orders, setOrders] = React.useState(mockOrders);

  React.useEffect(() => {
  }, []);

  const waiting = countByStatus(orders, "waiting");
  const confirmed = countByStatus(orders, "confirmed");
  const inprogress = countByStatus(orders, "inprogress");
  const done = countByStatus(orders, "done");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{t("admin.orders.title")}</h1>

      {/* Status cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatusCard
          title={t("admin.orders.status.waiting") }
          description={undefined}
          count={waiting}
          variant="blue"
        />

        <StatusCard
          title={t("admin.orders.status.confirmed") }
          count={confirmed}
          variant="indigo"
        />

        <StatusCard
          title={t("admin.orders.status.inprogress")}
          count={inprogress}
          variant="violet"
        />

        <StatusCard
          title={t("admin.orders.status.done") }
          count={done}
          variant="green"
        />
      </div>

      {/* Orders table */}
      <Card className="rounded-md overflow-hidden">
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="p-4 text-muted-foreground">{t("admin.orders.empty")}</div>
          ) : (
            <Table className="w-full p-0">
              <TableHeader className={`${tableHeader.bg} ${tableHeader.text}`}>
                <TableRow>
                  <TableHead className="rounded-tl-md">{t("admin.orders.table.id")}</TableHead>
                  <TableHead>{t("admin.orders.table.customer")}</TableHead>
                  <TableHead>{t("admin.orders.table.status")}</TableHead>
                  <TableHead>{t("admin.orders.table.total")}</TableHead>
                  <TableHead className="rounded-tr-md">{t('admin.orders.table.action')}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id} className="h-10">
                    <TableCell className="py-2">{o.id}</TableCell>
                    <TableCell className="py-2">{t(`admin.orders.customers.${o.customer}`)}</TableCell>
                    <TableCell className="py-2">{t(`admin.orders.status.${o.status.toLowerCase()}`) || o.status}</TableCell>
                    <TableCell className="py-2">{o.total}</TableCell>
                    <TableCell className="py-2">
                    <button className="p-1 rounded hover:bg-gray-100">
                      <MoreHorizontal size={16} />
                    </button>
                  </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <div className="flex items-center justify-between  border-t border-black-200 pt-4 pl-2 pr-2 pb-2">
            <div className="flex items-center gap-4">
                <select className="border rounded px-2 py-1">
                  <option>10</option>
                  <option>25</option>
                  <option>50</option>
                </select>
              <div className="text-sm text-muted-foreground">1-10 of {orders.length}</div>
              </div>

            <Pagination className="">
              <PaginationContent>
                <PaginationPrevious />
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">100</PaginationLink>
                </PaginationItem>
                <PaginationNext />
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

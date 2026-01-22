import * as React from "react";
import { Card, CardContent } from "~/components/ui";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui";
import { t } from "@/lib/i18n";

const sampleOrders = [
  { id: "#1001", customer: "Alice", status: "Delivered", total: "$12.00" },
  { id: "#1002", customer: "Bob", status: "In Progress", total: "$8.50" },
];

export default function OrdersPage(): React.JSX.Element {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{t("admin.orders.title")}</h1>
      <Card>
        <CardContent>
          {sampleOrders.length === 0 ? (
            <div className="text-muted-foreground">{t("admin.orders.empty")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.orders.table.id")}</TableHead>
                  <TableHead>{t("admin.orders.table.customer")}</TableHead>
                  <TableHead>{t("admin.orders.table.status")}</TableHead>
                  <TableHead>{t("admin.orders.table.total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleOrders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{o.id}</TableCell>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell>{o.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

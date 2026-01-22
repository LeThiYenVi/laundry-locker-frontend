import * as React from "react";
import { Card, CardContent } from "~/components/ui";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui";
import { t } from "@/lib/i18n";

const sampleLockers = [
  { id: "L-01", location: "Floor 1 - A1", status: "Available" },
  { id: "L-02", location: "Floor 2 - B3", status: "In Use" },
];

export default function LockersPage(): React.JSX.Element {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{t("admin.lockers.title")}</h1>

      <Card>
        <CardContent>
          {sampleLockers.length === 0 ? (
            <div className="text-muted-foreground">{t("admin.lockers.empty")}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.lockers.table.id")}</TableHead>
                  <TableHead>{t("admin.lockers.table.location")}</TableHead>
                  <TableHead>{t("admin.lockers.table.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleLockers.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.id}</TableCell>
                    <TableCell>{l.location}</TableCell>
                    <TableCell>{l.status}</TableCell>
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

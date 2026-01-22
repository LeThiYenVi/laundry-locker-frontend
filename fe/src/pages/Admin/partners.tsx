import * as React from "react";
import { Card, CardContent, Button } from "~/components/ui";
import { t } from "@/lib/i18n";

const samplePartners: Array<{ id: string; name: string; contact: string }> = [];

export default function PartnersPage(): React.JSX.Element {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{t("admin.partners.title")}</h1>
        <Button size="sm">Add Partner</Button>
      </div>

      <Card>
        <CardContent>
          {samplePartners.length === 0 ? (
            <div className="text-muted-foreground">{t("admin.partners.empty")}</div>
          ) : (
            <ul className="space-y-2">
              {samplePartners.map((p) => (
                <li key={p.id} className="p-3 border rounded-md flex justify-between">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-muted-foreground">{p.contact}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

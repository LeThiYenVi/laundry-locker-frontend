import * as React from "react";
import { Card, CardContent } from "~/components/ui";
import { t } from "@/lib/i18n";

const sampleFeedback: Array<{ id: string; user: string; message: string }> = [];

export default function FeedbackPage(): React.JSX.Element {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">{t("admin.feedback.title")}</h1>
      <Card>
        <CardContent>
          {sampleFeedback.length === 0 ? (
            <div className="text-muted-foreground">{t("admin.feedback.empty")}</div>
          ) : (
            <ul className="space-y-3">
              {sampleFeedback.map((f) => (
                <li key={f.id} className="p-3 border rounded-md">
                  <div className="font-medium">{f.user}</div>
                  <div className="text-sm text-muted-foreground">{f.message}</div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

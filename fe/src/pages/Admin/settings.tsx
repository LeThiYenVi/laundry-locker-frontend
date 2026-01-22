import * as React from "react";
import { Card, CardContent, Button } from "~/components/ui";
import LanguageSwitcher from "~/components/ui/LanguageSwitcher";
import { t } from "@/lib/i18n";

export default function SettingsPage():React.JSX.Element {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      <Card>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Language</div>
                <div className="text-xs text-muted-foreground">{t("info.devHint")}</div>
              </div>
              <div>
                <LanguageSwitcher />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600">Theme</div>
                <div className="text-xs text-muted-foreground">Switch between light/dark theme</div>
              </div>
              <div>
                <Button variant="ghost">Toggle Theme</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

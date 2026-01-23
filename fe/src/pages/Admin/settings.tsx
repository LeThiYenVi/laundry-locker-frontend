import * as React from "react";
import { Card, CardContent, Button, Switch } from "~/components/ui";
import LanguageSwitcher from "~/components/ui/LanguageSwitcher";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "~/components/ui";
import { t } from "@/lib/i18n";
import { Globe, SunMoon, Save, RefreshCw } from "lucide-react";

type SettingsModalProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function SettingsModal({ open = false, onOpenChange }: SettingsModalProps): React.JSX.Element {
  const [themeDark, setThemeDark] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(true);
  const [devMode, setDevMode] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const handleSave = () => {
    setSaving(true);
    // placeholder for API save
    setTimeout(() => setSaving(false), 700);
  };

  const handleReset = () => {
    setThemeDark(false);
    setAnalytics(true);
    setDevMode(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="border-0 bg-white opacity-100 shadow-lg ">
        <DialogHeader>
          <DialogTitle>{t('admin.settings.title') || 'Settings'}</DialogTitle>
          <DialogDescription>{t('admin.settings.subtitle') || 'Manage application preferences'}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2  ">
          <Card className="bg-white text-slate-900 border-gray-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Globe size={16} /> {t('admin.settings.language') || 'Language'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t('admin.settings.languageHelp') || t('info.devHint')}</div>
                </div>
                <LanguageSwitcher />
              </div>
            </CardContent>
          </Card>

            <Card className="bg-white text-slate-900 border-gray-200 ">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <SunMoon size={16} /> {t('admin.settings.theme') || 'Theme'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{t('admin.settings.themeHelp') || 'Toggle between light and dark modes'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Light</span>
                  <Switch checked={themeDark} onCheckedChange={(v) => setThemeDark(!!v)} />
                  <span className="text-sm text-muted-foreground">Dark</span>
                </div>
              </div>
            </CardContent>
          </Card>

              <Card className="bg-white text-slate-900 border-gray-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{t('admin.settings.analytics') || 'Analytics'}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('admin.settings.analyticsHelp') || 'Share anonymous usage data to help us improve.'}</div>
                </div>
                <Switch checked={analytics} onCheckedChange={(v) => setAnalytics(!!v)} />
              </div>
            </CardContent>
          </Card>

              <Card className="bg-white text-slate-900 border-gray-200">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{t('admin.settings.devMode') || 'Developer mode'}</div>
                  <div className="text-xs text-muted-foreground mt-1">{t('admin.settings.devModeHelp') || t('info.devHint')}</div>
                </div>
                <Switch checked={devMode} onCheckedChange={(v) => setDevMode(!!v)} />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2 w-full sm:justify-end">
            <Button variant="ghost" onClick={handleReset} className="flex items-center gap-2">
              <RefreshCw size={16} /> {t('admin.settings.reset') || 'Reset'}
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save size={16} /> {saving ? (t('admin.settings.saving') || 'Saving...') : (t('admin.settings.save') || 'Save changes')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

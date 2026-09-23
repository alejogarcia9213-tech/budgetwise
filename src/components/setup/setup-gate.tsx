import { FileSpreadsheet, Sparkles, Trash2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { SpreadsheetImportButtons } from "@/components/settings/spreadsheet-import";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export function SetupGate() {
  const lang = useAppStore((s) => s.lang);
  const complete = useAppStore((s) => s.setupComplete);
  const hydrated = useAppStore((s) => s.hydrated);
  if (!hydrated || complete) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-bg/80 p-4 md:items-center">
      <div className="w-full max-w-md rounded-2xl bg-card p-5 card-shadow md:p-6">
        <Logo />
        <h1 className="mt-4 text-xl font-semibold tracking-tight">{t(lang, "setup.title")}</h1>
        <p className="mt-2 text-sm text-muted">{t(lang, "setup.subtitle")}</p>
        <div className="mt-5 space-y-3">
          <button
            type="button"
            className="flex w-full items-start gap-3 rounded-xl bg-elevated p-3 text-left hover:bg-elevated/80"
            onClick={() => useAppStore.getState().setSetupComplete(true)}
          >
            <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
            <span>
              <span className="block text-sm font-medium">{t(lang, "setup.sample")}</span>
              <span className="mt-0.5 block text-xs text-muted">{t(lang, "setup.sampleHint")}</span>
            </span>
          </button>
          <button
            type="button"
            className="flex w-full items-start gap-3 rounded-xl bg-elevated p-3 text-left hover:bg-elevated/80"
            onClick={() => {
              useAppStore.getState().resetProfile();
              useAppStore.getState().setSetupComplete(true);
            }}
          >
            <Trash2 className="mt-0.5 size-5 shrink-0 text-muted" />
            <span>
              <span className="block text-sm font-medium">{t(lang, "setup.empty")}</span>
              <span className="mt-0.5 block text-xs text-muted">{t(lang, "setup.emptyHint")}</span>
            </span>
          </button>
          <div className="rounded-xl bg-elevated p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <FileSpreadsheet className="size-5 text-primary" />
              {t(lang, "setup.upload")}
            </div>
            <p className="mb-3 text-xs text-muted">{t(lang, "setup.uploadHint")}</p>
            <SpreadsheetImportButtons compact />
          </div>
          <Button variant="ghost" className="w-full" onClick={() => useAppStore.getState().setSetupComplete(true)}>
            {t(lang, "setup.skip")}
          </Button>
        </div>
      </div>
    </div>
  );
}

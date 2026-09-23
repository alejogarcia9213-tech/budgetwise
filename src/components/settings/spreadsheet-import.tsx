import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildBackup, downloadBlob, loadUndoBackup, parseBackup, saveUndoBackup } from "@/lib/backup";
import { currentMonthKey } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { importBudgetWorkbook } from "@/lib/sheet-import";
import { useAppStore } from "@/lib/store";

async function snapshotCurrent() {
  const s = useAppStore.getState();
  const backup = buildBackup({
    profiles: s.profiles,
    lang: s.lang,
    theme: s.theme,
    currency: s.currency,
    advancedView: s.advancedView,
    activeMonth: s.activeMonth,
    activeProfileId: s.activeProfileId,
    calc: s.calc,
  });
  const json = JSON.stringify(backup);
  await saveUndoBackup(json);
  downloadBlob(`budget-wise-backup-before-import.json`, json, "application/json");
  useAppStore.getState().setHasUndoImport(true);
}

export async function applySpreadsheet(file: File) {
  const buf = await file.arrayBuffer();
  const until = currentMonthKey();
  const name = useAppStore.getState().profiles.find((p) => p.id === useAppStore.getState().activeProfileId)?.name ?? "Main";
  const { profile, summary } = await importBudgetWorkbook(buf, { until, profileName: name });
  const s = useAppStore.getState();
  profile.id = s.activeProfileId;
  await snapshotCurrent();
  s.importProfiles(
    s.profiles.map((p) => (p.id === profile.id ? profile : p)),
    { activeMonth: summary.lastMonth ?? until, activeProfileId: profile.id },
  );
  s.setSetupComplete(true);
  return summary;
}

export async function restoreUndoImport() {
  const raw = await loadUndoBackup();
  if (!raw) return false;
  const parsed = parseBackup(raw);
  if (!parsed.ok) return false;
  useAppStore.getState().importProfiles(parsed.data.profiles, {
    lang: parsed.data.lang as never,
    theme: parsed.data.theme as never,
    currency: parsed.data.currency as never,
    advancedView: parsed.data.advancedView,
    activeMonth: parsed.data.activeMonth,
    activeProfileId: parsed.data.activeProfileId,
  });
  return true;
}

export function SpreadsheetImportButtons({ compact = false }: { compact?: boolean }) {
  const lang = useAppStore((s) => s.lang);
  const hasUndo = useAppStore((s) => s.hasUndoImport);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    setBusy(true);
    try {
      const summary = await applySpreadsheet(file);
      toast.success(
        t(lang, "import.ok", {
          months: summary.months,
          first: summary.firstMonth ?? "",
          last: summary.lastMonth ?? "",
        }),
      );
    } catch {
      toast.error(t(lang, "import.bad"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onFile(f);
          e.target.value = "";
        }}
      />
      <Button
        variant={compact ? "secondary" : "default"}
        className="w-full"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
      >
        {busy ? t(lang, "import.working") : t(lang, "import.excel")}
      </Button>
      {hasUndo ? (
        <Button
          variant="secondary"
          className="w-full"
          onClick={async () => {
            const ok = await restoreUndoImport();
            toast[ok ? "success" : "error"](t(lang, ok ? "import.restoreOk" : "import.bad"));
          }}
        >
          {t(lang, "import.restore")}
        </Button>
      ) : null}
      <p className="text-xs text-subtle">{t(lang, "import.excelHint")}</p>
    </div>
  );
}

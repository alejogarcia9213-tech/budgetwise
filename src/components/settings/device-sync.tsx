import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/finance/panel";
import { buildBackup, downloadBlob, parseBackup } from "@/lib/backup";
import { t, type Lang } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

function currentBackupJson() {
  const s = useAppStore.getState();
  return JSON.stringify(
    buildBackup({
      profiles: s.profiles,
      lang: s.lang,
      theme: s.theme,
      currency: s.currency,
      advancedView: s.advancedView,
      activeMonth: s.activeMonth,
      activeProfileId: s.activeProfileId,
      calc: s.calc,
    }),
    null,
    2,
  );
}

function applyBackupText(raw: string, lang: Lang) {
  const parsed = parseBackup(raw);
  if (!parsed.ok) {
    toast.error(t(lang, "reports.importBad"));
    return false;
  }
  if (!window.confirm(t(lang, "reports.confirmImport"))) return false;
  useAppStore.getState().importProfiles(parsed.data.profiles, {
    lang: parsed.data.lang as never,
    theme: parsed.data.theme as never,
    currency: parsed.data.currency as never,
    advancedView: parsed.data.advancedView,
    activeMonth: parsed.data.activeMonth,
    activeProfileId: parsed.data.activeProfileId,
  });
  toast.success(t(lang, "reports.importOk"));
  return true;
}

export function DeviceSyncPanel() {
  const lang = useAppStore((s) => s.lang);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const month = useAppStore((s) => s.activeMonth);

  function download() {
    downloadBlob(`budget-wise-backup-${month}.json`, currentBackupJson(), "application/json");
    toast.success(t(lang, "sync.exported"));
  }

  async function share() {
    const json = currentBackupJson();
    const file = new File([json], `budget-wise-backup-${month}.json`, { type: "application/json" });
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Budget Wise" });
        return;
      }
      if (navigator.share) {
        await navigator.share({ title: "Budget Wise", text: json });
        return;
      }
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
    }
    download();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(currentBackupJson());
      toast.success(t(lang, "sync.copied"));
    } catch {
      download();
    }
  }

  return (
    <Panel>
      <h2 className="mb-1 text-lg font-semibold">{t(lang, "sync.title")}</h2>
      <p className="mb-3 text-sm text-muted">{t(lang, "sync.hint")}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" className="h-auto min-h-11 whitespace-normal px-2 py-2 text-xs sm:text-sm" onClick={download}>
          {t(lang, "sync.export")}
        </Button>
        <Button variant="secondary" className="h-auto min-h-11 whitespace-normal px-2 py-2 text-xs sm:text-sm" onClick={() => void share()}>
          {t(lang, "sync.share")}
        </Button>
        <Button variant="secondary" className="h-auto min-h-11 whitespace-normal px-2 py-2 text-xs sm:text-sm" onClick={() => void copy()}>
          {t(lang, "sync.copy")}
        </Button>
        <Button
          variant="secondary"
          className="h-auto min-h-11 whitespace-normal px-2 py-2 text-xs sm:text-sm"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {t(lang, "sync.import")}
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          const reader = new FileReader();
          reader.onload = () => {
            applyBackupText(String(reader.result ?? ""), lang);
            setBusy(false);
          };
          reader.onerror = () => setBusy(false);
          reader.readAsText(f);
        }}
      />
    </Panel>
  );
}

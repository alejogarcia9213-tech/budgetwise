import { useState } from "react";
import { Moon, Pencil, Plus, Settings, Sun, Trash2, User, UserMinus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { SpreadsheetImportButtons } from "@/components/settings/spreadsheet-import";
import { DeviceSyncPanel } from "@/components/settings/device-sync";
import { WalletCaptureSettings } from "@/components/settings/wallet-capture";
import { AutoCaptureSettings } from "@/components/settings/auto-capture";
import { Panel } from "@/components/finance/panel";
import { t, LANGS, type Lang } from "@/lib/i18n";
import { CURRENCIES } from "@/lib/money";
import { useAppStore, useProfile } from "@/lib/store";

export function SettingsView() {
  const lang = useAppStore((s) => s.lang);
  const theme = useAppStore((s) => s.theme);
  const currency = useAppStore((s) => s.currency);
  const advanced = useAppStore((s) => s.advancedView);
  const profiles = useAppStore((s) => s.profiles);
  const activeId = useAppStore((s) => s.activeProfileId);
  const profile = useProfile();
  const [payName, setPayName] = useState("");
  const [payColor, setPayColor] = useState("#6e7bff");
  const [rename, setRename] = useState(profile.name);
  const [editPayId, setEditPayId] = useState<string | null>(null);
  const [editPayName, setEditPayName] = useState("");
  const [editPayColor, setEditPayColor] = useState("#6e7bff");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <Panel>
        <h1 className="mb-4 flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Settings className="size-6 text-muted" />
          {t(lang, "settings.title")}
        </h1>

        <p className="mb-2 text-sm font-medium">{t(lang, "budget.budgetProfile")}</p>
        <div className="mb-3 flex gap-2">
          <div className="relative min-w-0 flex-1">
            <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <NativeSelect
              value={activeId}
              onChange={(e) => useAppStore.getState().setActiveProfile(e.target.value)}
              className="pl-9"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <Button
            variant="secondary"
            size="icon"
            aria-label={t(lang, "budget.addProfile")}
            onClick={() => {
              const name = window.prompt(t(lang, "budget.addProfile"), t(lang, "budget.profileDefaultName"));
              if (name) useAppStore.getState().addProfile(name);
            }}
          >
            <UserPlus className="size-4" />
          </Button>
          <Button
            variant="danger"
            size="icon"
            aria-label={t(lang, "budget.removeProfile")}
            onClick={() => {
              if (window.confirm(t(lang, "budget.confirmDeleteProfile"))) {
                useAppStore.getState().removeProfile(activeId);
              }
            }}
          >
            <UserMinus className="size-4" />
          </Button>
        </div>
        <div className="mb-4 flex gap-2">
          <Input value={rename} onChange={(e) => setRename(e.target.value)} aria-label={t(lang, "settings.rename")} />
          <Button
            variant="secondary"
            onClick={() => {
              if (rename.trim()) useAppStore.getState().renameProfile(activeId, rename.trim());
            }}
          >
            {t(lang, "common.save")}
          </Button>
        </div>

        <div className="mb-3">
          <NativeSelect
            value={currency}
            onChange={(e) => useAppStore.getState().setCurrency(e.target.value as typeof currency)}
            aria-label={t(lang, "budget.currency")}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="mb-4">
          <NativeSelect
            value={lang}
            onChange={(e) => useAppStore.getState().setLang(e.target.value as Lang)}
            aria-label={t(lang, "budget.language")}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </NativeSelect>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <Sun className="size-4 text-muted" />
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(v) => useAppStore.getState().setTheme(v ? "dark" : "light")}
            aria-label={t(lang, "settings.theme")}
          />
          <Moon className="size-4 text-muted" />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm">{t(lang, "budget.advanced")}</span>
          <Switch checked={advanced} onCheckedChange={(v) => useAppStore.getState().setAdvanced(v)} />
        </div>

        <p className="mb-3 text-center text-sm font-medium">{t(lang, "budget.paymentMethods")}</p>
        <ul className="space-y-2">
          {profile.paymentMethods.map((m) => (
            <li key={m.id} className="rounded-md bg-elevated px-3 py-2.5">
              {editPayId === m.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editPayColor}
                    onChange={(e) => setEditPayColor(e.target.value)}
                    className="h-11 w-11 shrink-0 rounded-md bg-card p-1"
                    aria-label="Color"
                  />
                  <Input
                    value={editPayName}
                    onChange={(e) => setEditPayName(e.target.value)}
                    aria-label={t(lang, "budget.method")}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (!editPayName.trim()) return;
                      useAppStore.getState().updatePaymentMethod(m.id, {
                        name: editPayName.trim(),
                        color: editPayColor,
                      });
                      setEditPayId(null);
                    }}
                  >
                    {t(lang, "common.save")}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    <span className="size-2.5 shrink-0 rounded-full" style={{ background: m.color }} />
                    <span className="truncate">{m.name}</span>
                  </span>
                  <span className="flex shrink-0">
                    <button
                      className="flex size-11 items-center justify-center text-muted hover:text-fg"
                      onClick={() => {
                        setEditPayId(m.id);
                        setEditPayName(m.name);
                        setEditPayColor(m.color);
                      }}
                      aria-label={t(lang, "common.edit")}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      className="flex size-11 items-center justify-center text-muted hover:text-danger"
                      onClick={() => useAppStore.getState().removePaymentMethod(m.id)}
                      aria-label={t(lang, "budget.delete")}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <Input
            placeholder={t(lang, "budget.addPayment")}
            value={payName}
            onChange={(e) => setPayName(e.target.value)}
          />
          <input
            type="color"
            value={payColor}
            onChange={(e) => setPayColor(e.target.value)}
            className="h-11 w-11 shrink-0 rounded-md bg-elevated p-1"
            aria-label="Color"
          />
          <Button
            size="icon"
            onClick={() => {
              if (!payName.trim()) return;
              useAppStore.getState().addPaymentMethod(payName.trim(), payColor);
              setPayName("");
            }}
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </Panel>

      <DeviceSyncPanel />

      <AutoCaptureSettings />
      <WalletCaptureSettings />

      <Panel>
        <h2 className="mb-1 text-lg font-semibold">{t(lang, "import.excel")}</h2>
        <p className="mb-3 text-sm text-muted">{t(lang, "setup.uploadHint")}</p>
        <SpreadsheetImportButtons />
      </Panel>

      <p className="text-sm text-muted">{t(lang, "settings.privacy")}</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={() => useAppStore.getState().restoreSample()}>
          {t(lang, "budget.loadSample")}
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => {
            if (window.confirm(t(lang, "budget.confirmReset"))) useAppStore.getState().resetProfile();
          }}
        >
          {t(lang, "budget.reset")}
        </Button>
      </div>
    </div>
  );
}

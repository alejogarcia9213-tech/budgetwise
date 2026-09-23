import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Panel } from "@/components/finance/panel";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export function WalletCaptureSettings() {
  const lang = useAppStore((s) => s.lang);
  const on = useAppStore((s) => s.smartTransactionCapture);

  return (
    <Panel>
      <h2 className="text-lg font-semibold">{t(lang, "wallet.title")}</h2>
      <p className="mt-2 text-sm text-muted">{t(lang, "wallet.explain")}</p>
      <p className="mt-2 text-sm text-muted">{t(lang, "wallet.webLimit")}</p>
      <label className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span>{t(lang, "wallet.enable")}</span>
        <Switch checked={on} onCheckedChange={(v) => useAppStore.getState().setSmartCapture(v)} />
      </label>
      {on ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              useAppStore.getState().ingestNotification({
                packageName: "com.google.android.apps.walletnfcrel",
                appLabel: "Google Wallet",
                title: "REWE",
                text: "Zahlung 23,90 € mit Visa •••• 1234",
                postedAt: Date.now(),
              });
            }}
          >
            {t(lang, "wallet.sample")}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => useAppStore.getState().clearSuggestions()}>
            {t(lang, "wallet.clearPending")}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => useAppStore.getState().clearMerchantRules()}>
            {t(lang, "wallet.clearRules")}
          </Button>
        </div>
      ) : null}
    </Panel>
  );
}

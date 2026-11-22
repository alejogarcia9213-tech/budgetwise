import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Panel } from "@/components/finance/panel";
import { AmountExprInput } from "@/components/finance/amount-expr";
import { t } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import type { CategoryId } from "@/lib/types";
import { useAppStore, useProfile } from "@/lib/store";

export function SuggestionInbox({ excludeId }: { excludeId?: string | null } = {}) {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const enabled = useAppStore((s) => s.smartTransactionCapture);
  const profile = useProfile();
  const pending = (profile.captureSuggestions ?? []).filter((s) => s.status === "pending" && s.id !== excludeId);
  const [editId, setEditId] = useState<string | null>(null);
  if (!enabled || pending.length === 0) return null;

  return (
    <Panel accent="commit">
      <h2 className="text-lg font-semibold">{t(lang, "wallet.inbox")}</h2>
      <p className="mt-1 text-sm text-muted">{t(lang, "wallet.inboxHint")}</p>
      <ul className="mt-3 space-y-2">
        {pending.map((s) => (
          <li key={s.id} className="rounded-xl bg-elevated p-3">
            <p className="font-medium">{s.merchantNormalized}</p>
            <p className="text-sm text-muted">
              {s.amountMinor != null ? formatMoney(s.amountMinor / 100, currency, lang) : "—"}
              {s.cardLastFour ? ` · •••• ${s.cardLastFour}` : ""}
              {s.walletChannel === "google_wallet" ? ` · ${t(lang, "wallet.viaWallet")}` : s.sourceAppLabel ? ` · ${s.sourceAppLabel}` : ""}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => useAppStore.getState().confirmSuggestion(s.id)}>
                {t(lang, "wallet.confirm")}
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setEditId(s.id)}>
                {t(lang, "common.edit")}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => useAppStore.getState().dismissSuggestion(s.id)}>
                {t(lang, "wallet.dismiss")}
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {editId ? <EditSuggestion id={editId} onClose={() => setEditId(null)} /> : null}
    </Panel>
  );
}

function EditSuggestion({ id, onClose }: { id: string; onClose: () => void }) {
  const lang = useAppStore((s) => s.lang);
  const profile = useProfile();
  const s = (profile.captureSuggestions ?? []).find((x) => x.id === id);
  const [name, setName] = useState(s?.merchantNormalized ?? "");
  const [amount, setAmount] = useState(s?.amountMinor != null ? s.amountMinor / 100 : 0);
  const [category, setCategory] = useState<CategoryId>(s?.categoryId ?? "essential");
  const [methodId, setMethodId] = useState(s?.paymentMethodId ?? "");
  const [always, setAlways] = useState(false);
  if (!s) return null;
  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent title={t(lang, "wallet.edit")}>
        <div className="space-y-3">
          <div>
            <Label>{t(lang, "budget.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t(lang, "budget.total")}</Label>
            <AmountExprInput value={amount} onValue={setAmount} />
          </div>
          <div>
            <Label>{t(lang, "common.category")}</Label>
            <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
              <option value="essential">{t(lang, "budget.essential")}</option>
              <option value="investing">{t(lang, "budget.investing")}</option>
              <option value="flexible">{t(lang, "budget.flexible")}</option>
            </NativeSelect>
          </div>
          <div>
            <Label>{t(lang, "common.method")}</Label>
            <NativeSelect value={methodId} onChange={(e) => setMethodId(e.target.value)}>
              <option value="">{t(lang, "budget.methodNone")}</option>
              {profile.paymentMethods.filter((m) => !m.archived).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={always} onChange={(e) => setAlways(e.target.checked)} />
            {t(lang, "wallet.alwaysCat")}
          </label>
          <Button
            className="w-full"
            onClick={() => {
              useAppStore.getState().confirmSuggestion(id, {
                name,
                amount,
                category,
                methodId: methodId || undefined,
                alwaysCategory: always,
              });
              onClose();
            }}
          >
            {t(lang, "wallet.confirm")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

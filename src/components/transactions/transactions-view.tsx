import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { TxDialog } from "@/components/finance/tx-dialog";
import { ReceiptScanButton } from "@/components/finance/receipt-scan";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { txsInMonth, txSigned } from "@/lib/budget";
import { t } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { useAppStore, useProfile, type Transaction, type TxType } from "@/lib/store";
import { cn } from "@/lib/utils";

export function TransactionsView() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | TxType>("all");
  const [method, setMethod] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();

  const list = useMemo(() => {
    return txsInMonth(profile, month)
      .filter((tx) => (type === "all" ? true : tx.type === type))
      .filter((tx) => (method === "all" ? true : tx.methodId === method))
      .filter((tx) => (q.trim() ? `${tx.name} ${tx.notes ?? ""}`.toLowerCase().includes(q.toLowerCase()) : true))
      .sort((a, b) => b.date.localeCompare(a.date) || b.name.localeCompare(a.name));
  }, [profile, month, type, method, q]);

  const income = list.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const out = list.filter((t) => t.type !== "income").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "tx.title")}</h1>
        <Button
          className="shrink-0"
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">{t(lang, "tx.add")}</span>
          <span className="sm:hidden">{t(lang, "common.add")}</span>
        </Button>
      </header>
      <ReceiptScanButton />
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-card p-3 card-shadow">
          <p className="text-xs text-muted">{t(lang, "tx.income")}</p>
          <p className="tabular text-success font-semibold">{formatMoney(income, currency, lang)}</p>
        </div>
        <div className="rounded-xl bg-card p-3 card-shadow">
          <p className="text-xs text-muted">{t(lang, "tx.net")}</p>
          <p className={cn("tabular font-semibold", income - out < 0 ? "text-danger" : "text-fg")}>
            {formatMoney(income - out, currency, lang)}
          </p>
        </div>
      </div>
      <Input placeholder={t(lang, "common.search")} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="flex gap-2">
        <NativeSelect value={type} onChange={(e) => setType(e.target.value as typeof type)} className="flex-1">
          <option value="all">{t(lang, "common.all")}</option>
          <option value="income">{t(lang, "tx.income")}</option>
          <option value="expense">{t(lang, "tx.expense")}</option>
          <option value="saving">{t(lang, "tx.saving")}</option>
          <option value="investment">{t(lang, "tx.investment")}</option>
          <option value="debt-payment">{t(lang, "tx.debt")}</option>
        </NativeSelect>
        <NativeSelect value={method} onChange={(e) => setMethod(e.target.value)} className="flex-1">
          <option value="all">{t(lang, "common.method")}</option>
          {profile.paymentMethods.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </NativeSelect>
      </div>
      {list.length === 0 ? (
        <p className="py-12 text-center text-sm text-subtle">{t(lang, "tx.empty")}</p>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-card card-shadow">
          {list.map((tx) => {
            const signed = txSigned(tx);
            const pm = profile.paymentMethods.find((m) => m.id === tx.methodId);
            return (
              <li key={tx.id} className="flex min-h-14 items-center gap-2 px-3 py-2 sm:px-4">
                <button
                  className="min-h-11 min-w-0 flex-1 text-left"
                  onClick={() => {
                    setEditing(tx);
                    setOpen(true);
                  }}
                >
                  <p className="truncate font-medium">{tx.name}</p>
                  <p className="text-xs text-muted">
                    {tx.date}
                    {pm ? ` · ${pm.name}` : ""}
                  </p>
                </button>
                <span className={cn("shrink-0 tabular text-sm font-medium", signed >= 0 ? "text-success" : "text-fg")}>
                  {signed >= 0 ? "+" : ""}
                  {formatMoney(signed, currency, lang)}
                </span>
                <button
                  className="flex size-11 shrink-0 items-center justify-center text-muted hover:text-danger"
                  aria-label={t(lang, "common.delete")}
                  onClick={() => {
                    if (window.confirm(t(lang, "tx.confirmDelete"))) {
                      useAppStore.getState().deleteTransaction(tx.id);
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <TxDialog key={editing?.id ?? "new"} open={open} onOpenChange={setOpen} initial={editing} />
    </div>
  );
}

import { useMemo, useState } from "react";
import { daysInMonth, formatDayTitle, startWeekday } from "@/lib/dates";
import { txsInMonth, txSigned } from "@/lib/budget";
import { t } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { useAppStore, useProfile } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CalendarView() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const txs = txsInMonth(profile, month);
  const [day, setDay] = useState<string | null>(null);

  const dim = daysInMonth(month);
  const start = startWeekday(month);
  const cells = useMemo(() => {
    const list: (number | null)[] = [];
    for (let i = 0; i < start; i++) list.push(null);
    for (let d = 1; d <= dim; d++) list.push(d);
    while (list.length % 7 !== 0) list.push(null);
    return list;
  }, [start, dim]);

  const byDay = useMemo(() => {
    const map: Record<string, typeof txs> = {};
    for (const tx of txs) {
      (map[tx.date] ??= []).push(tx);
    }
    return map;
  }, [txs]);

  const selected = day ? (byDay[day] ?? []) : [];
  const income = txs.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const expenses = txs.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const saved = txs.filter((x) => x.type === "saving").reduce((s, x) => s + x.amount, 0);
  const invested = txs.filter((x) => x.type === "investment").reduce((s, x) => s + x.amount, 0);

  const weekdays = t(lang, "cal.weekdays").split(",");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "cal.title")}</h1>
      </header>
      <div className="rounded-2xl bg-card p-3 card-shadow sm:p-4">
        <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted">
          {weekdays.map((w, i) => (
            <div key={`${w}-${i}`} className="py-1 font-medium">
              {w}
            </div>
          ))}
          {cells.map((d, i) => {
            if (d == null) return <div key={`e-${i}`} />;
            const iso = `${month}-${String(d).padStart(2, "0")}`;
            const has = (byDay[iso] ?? []).length > 0;
            const active = day === iso;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setDay(iso)}
                className={cn(
                  "relative flex h-11 items-center justify-center rounded-md text-sm",
                  active ? "bg-primary text-primary-fg" : "hover:bg-elevated",
                )}
              >
                {d}
                {has ? (
                  <span
                    className={cn(
                      "absolute bottom-1 size-1 rounded-full",
                      active ? "bg-primary-fg" : "bg-primary",
                    )}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Stat label={t(lang, "cal.income")} value={formatMoney(income, currency, lang)} />
        <Stat label={t(lang, "cal.expenses")} value={formatMoney(expenses, currency, lang)} />
        <Stat label={t(lang, "cal.saved")} value={formatMoney(saved, currency, lang)} />
        <Stat label={t(lang, "cal.invested")} value={formatMoney(invested, currency, lang)} />
      </div>
      <div className="rounded-2xl bg-card p-5 card-shadow">
        <h2 className="font-semibold">{day ? formatDayTitle(day, lang) : t(lang, "cal.title")}</h2>
        {!day ? (
          <p className="mt-2 text-sm text-muted">{t(lang, "cal.emptyDay")}</p>
        ) : selected.length === 0 ? (
          <p className="mt-2 text-sm text-muted">{t(lang, "cal.emptyDay")}</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {selected.map((tx) => {
              const signed = txSigned(tx);
              return (
                <li key={tx.id} className="flex justify-between py-2 text-sm">
                  <span>{tx.name}</span>
                  <span className={cn("tabular", signed >= 0 ? "text-success" : "text-fg")}>
                    {signed >= 0 ? "+" : ""}
                    {formatMoney(signed, currency, lang)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <p className="text-sm text-muted">
        {t(lang, "cal.net")}: {formatMoney(income - expenses - saved - invested, currency, lang)}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-3 card-shadow">
      <p className="text-xs text-muted">{label}</p>
      <p className="tabular font-medium">{value}</p>
    </div>
  );
}

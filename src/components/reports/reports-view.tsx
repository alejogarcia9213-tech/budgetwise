import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { HealthCard, YearlyCard } from "@/components/finance/analysis-cards";
import { MonthlySummary } from "@/components/finance/budget-cards";
import { Button } from "@/components/ui/button";
import { DeviceSyncPanel } from "@/components/settings/device-sync";
import { csvEscape, downloadBlob } from "@/lib/backup";
import { monthSnapshot, txsInMonth } from "@/lib/budget";
import { monthTitle } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { useAppStore, useProfile } from "@/lib/store";

export function ReportsView() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const snap = monthSnapshot(profile, month);
  const txs = txsInMonth(profile, month).slice().sort((a, b) => b.amount - a.amount);
  const top = txs.slice(0, 8);

  function exportCsv() {
    const rows = [
      ["date", "type", "category", "name", "amount", "method", "notes"].join(","),
      ...profile.transactions.map((tx) =>
        [
          tx.date,
          tx.type,
          tx.category,
          csvEscape(tx.name),
          tx.amount,
          csvEscape(profile.paymentMethods.find((m) => m.id === tx.methodId)?.name ?? ""),
          csvEscape(tx.notes ?? ""),
        ].join(","),
      ),
    ];
    downloadBlob(`budget-wise-transactions-${profile.name}.csv`, rows.join("\n"), "text/csv");
  }

  const spendTxs = txs.filter((tx) => tx.type !== "income");
  const unassignedTotal = spendTxs.filter((tx) => !tx.methodId).reduce((s, tx) => s + tx.amount, 0);
  const methodTotals = [
    ...profile.paymentMethods.map((m) => ({
      id: m.id,
      name: m.name,
      color: m.color,
      total: spendTxs.filter((tx) => tx.methodId === m.id).reduce((s, tx) => s + tx.amount, 0),
    })),
    ...(unassignedTotal > 0
      ? [{ id: "none", name: t(lang, "reports.unassigned"), color: "#64748b", total: unassignedTotal }]
      : []),
  ].filter((m) => m.total > 0);
  const methodSum = methodTotals.reduce((s, m) => s + m.total, 0);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "reports.title")}</h1>
        <p className="mt-1 text-sm text-muted">{t(lang, "reports.subtitle")}</p>
      </header>
      <DeviceSyncPanel />
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" className="h-auto min-h-11 whitespace-normal px-2 py-2 text-center text-xs sm:text-sm" onClick={exportCsv}>
          {t(lang, "reports.exportCsv")}
        </Button>
        <Button variant="secondary" className="h-auto min-h-11 whitespace-normal px-2 py-2 text-center text-xs sm:text-sm" onClick={() => window.print()}>
          {t(lang, "reports.print")}
        </Button>
      </div>
      <p className="text-xs text-subtle">{t(lang, "reports.backupHint")}</p>
      <section className="rounded-2xl bg-card p-5 card-shadow print:shadow-none">
        <h2 className="text-lg font-semibold">
          {t(lang, "reports.monthly")} · {monthTitle(month, lang)}
        </h2>
        <p className="mt-3 text-3xl font-semibold tabular">{formatMoney(snap.income, currency, lang)}</p>
        <p className="text-xs text-muted">{t(lang, "budget.totalIncome")}</p>
      </section>
      <MonthlySummary />
      <div className="rounded-2xl bg-card p-5 card-shadow">
        <h2 className="font-semibold">{t(lang, "reports.topTx")}</h2>
        {top.length === 0 ? (
          <p className="py-6 text-center text-sm text-subtle">{t(lang, "common.empty")}</p>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {top.map((tx) => (
              <li key={tx.id} className="flex justify-between py-2 text-sm">
                <span>{tx.name}</span>
                <span className="tabular">{formatMoney(tx.amount, currency, lang)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {methodTotals.length > 0 ? (
        <div className="rounded-2xl bg-card p-5 card-shadow">
          <h2 className="font-semibold">{t(lang, "reports.byMethod")}</h2>
          <div className="mx-auto mt-2 h-44 w-full max-w-[220px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={methodTotals} dataKey="total" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                  {methodTotals.map((m) => (
                    <Cell key={m.id} fill={m.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatMoney(Number(v), currency, lang)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 divide-y divide-border">
            {methodTotals.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: m.color }} />
                  <span className="truncate">{m.name}</span>
                </span>
                <span className="shrink-0 tabular text-muted">
                  {formatMoney(m.total, currency, lang)}
                  {methodSum > 0 ? ` · ${((m.total / methodSum) * 100).toFixed(0)}%` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <YearlyCard />
      <HealthCard />
    </div>
  );
}

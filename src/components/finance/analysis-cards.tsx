import { useMemo, useState } from "react";
import { Check, CircleHelp, Lightbulb, Repeat, TrendingUp, X } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Fold, Panel, Row } from "@/components/finance/panel";
import { AmountExprInput } from "@/components/finance/amount-expr";
import { getAiTip } from "@/lib/ai-tip";
import { monthSnapshot, yearRows } from "@/lib/budget";
import { t } from "@/lib/i18n";
import { formatMoney, formatPct } from "@/lib/money";
import { computeHealth } from "@/lib/ratios";
import { pickTip, answerBudgetQuestion } from "@/lib/tips";
import { useAppStore, useMonthData, useProfile } from "@/lib/store";

export function HealthCard() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const snap = monthSnapshot(profile, month);
  const [hint, setHint] = useState<string | null>(null);
  const health = computeHealth({
    ...profile.assets,
    debts: profile.debts,
    monthlyEssentials: snap.essential || snap.targets.essential,
    monthlyIncome: snap.income,
    monthlySaved: snap.savings,
    monthlyInvested: snap.investing,
  });
  const assetFields: { key: keyof typeof profile.assets; label: string }[] = [
    { key: "cash", label: t(lang, "budget.cash") },
    { key: "bank", label: t(lang, "budget.bank") },
    { key: "savings", label: t(lang, "budget.savings") },
    { key: "investments", label: t(lang, "budget.investments") },
    { key: "property", label: t(lang, "budget.property") },
    { key: "other", label: t(lang, "budget.other") },
  ];
  return (
    <Panel fold="health" foldTitle={t(lang, "budget.health")} accent="review">
      <h2 className="fold-title text-lg font-semibold">{t(lang, "budget.health")}</h2>
      <p className="text-sm text-muted">{t(lang, "budget.healthHint")}</p>
      <div className="mt-4 space-y-3">
        <Fold title={t(lang, "budget.netWorth")}>
          {assetFields.map((f) => (
            <div key={f.key} className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <Label className="mb-0">{f.label}</Label>
              <AmountExprInput
                className="h-11 w-full sm:w-32"
                value={profile.assets[f.key]}
                onValue={(n) => useAppStore.getState().setAssets({ [f.key]: n })}
              />
            </div>
          ))}
          <Row label={t(lang, "budget.assets")} value={formatMoney(health.totalAssets, currency, lang)} />
          <Row
            label={t(lang, "budget.liabilities")}
            value={formatMoney(health.totalLiabilities, currency, lang)}
            tone="danger"
          />
          <Row label={t(lang, "budget.netWorthLabel")} value={formatMoney(health.netWorth, currency, lang)} />
        </Fold>
        <Fold title={t(lang, "budget.ratios")} defaultOpen>
          {health.ratios.map((r) => (
            <div key={r.key} className="flex min-h-11 items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0">
              <button
                className="flex min-w-0 items-center gap-1.5 text-left text-muted"
                onClick={() => setHint(hint === r.key ? null : r.key)}
                aria-label={`${t(lang, `budget.${r.key}`)} — ${r.healthy ? t(lang, "budget.leftoverOk") : t(lang, "budget.leftoverNeg")}`}
              >
                <span className="min-w-0">{t(lang, `budget.${r.key}`)}</span>
                <CircleHelp className="size-3.5 shrink-0" />
              </button>
              <span className="flex shrink-0 items-center gap-2 tabular">
                {r.unit === "months" ? `${r.display} ${t(lang, "budget.monthsUnit")}` : formatPct(r.value, lang)}
                {r.healthy ? (
                  <Check className="size-4 text-success" aria-label="Healthy" />
                ) : (
                  <X className="size-4 text-danger" aria-label="Needs attention" />
                )}
              </span>
            </div>
          ))}
          {hint ? (
            <p className="mt-2 rounded-md bg-card px-3 py-2 text-xs text-muted">{t(lang, `budget.hints.${hint}`)}</p>
          ) : null}
        </Fold>
      </div>
    </Panel>
  );
}

export function YearlyCard() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const year = month.slice(0, 4);
  const rows = useMemo(() => yearRows(profile, year), [profile, year]);
  const totals = rows.reduce(
    (acc, r) => ({
      income: acc.income + r.income,
      expenses: acc.expenses + r.expenses,
      saved: acc.saved + r.saved,
      invested: acc.invested + r.invested,
      leftover: acc.leftover + r.leftover,
    }),
    { income: 0, expenses: 0, saved: 0, invested: 0, leftover: 0 },
  );
  return (
    <Panel fold="yearly" foldTitle={t(lang, "budget.yearly", { year })} accent="review">
      <p className="text-sm text-muted">{t(lang, "budget.yearlyHint")}</p>
      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-subtle">{t(lang, "budget.noYearly")}</p>
      ) : (
        <div className="mt-3 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <XAxis dataKey="month" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v) => formatMoney(Number(v), currency, lang)}
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
              />
              <Bar dataKey="income" fill="var(--color-chart-2)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--color-danger)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <Row label={t(lang, "budget.totalIncome")} value={formatMoney(totals.income, currency, lang)} />
      <Row label={t(lang, "budget.totalExpenses")} value={formatMoney(totals.expenses, currency, lang)} tone="danger" />
      <Row label={t(lang, "budget.totalSaved")} value={formatMoney(totals.saved, currency, lang)} tone="success" />
      <Row label={t(lang, "budget.totalInvested")} value={formatMoney(totals.invested, currency, lang)} />
      <Row label={t(lang, "budget.finalBalance")} value={formatMoney(totals.leftover, currency, lang)} />
    </Panel>
  );
}

export function TipCard() {
  const lang = useAppStore((s) => s.lang);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const data = useMonthData();
  const snap = monthSnapshot(profile, month);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const health = computeHealth({
    ...profile.assets,
    debts: profile.debts,
    monthlyEssentials: snap.essential || snap.targets.essential,
    monthlyIncome: snap.income,
    monthlySaved: snap.savings,
    monthlyInvested: snap.investing,
  });

  function localTip() {
    const tip = pickTip(
      {
        netIncome: snap.income,
        essentialExpenses: snap.essential,
        flexibleExpenses: snap.flexible,
        savings: snap.savings,
        investments: snap.investing,
        debts: health.totalLiabilities,
        netWorth: health.netWorth,
        liquidityMonths: health.ratios.find((r) => r.key === "liquidity")?.value ?? 0,
        savingsInvestmentRate: health.ratios.find((r) => r.key === "savInvRate")?.value ?? 0,
        leftToBudget: snap.leftToBudget,
        leftover: snap.leftover,
      },
      profile.tipId,
    );
    useAppStore.getState().setAiTip(lang === "es" ? tip.es : tip.en, tip.id);
  }

  async function grokTip() {
    setLoading(true);
    setErr(null);
    const snapshot = [
      `lang=${lang}`,
      `income=${data.income}`,
      `essential=${snap.essential}`,
      `flexible=${snap.flexible}`,
      `savings=${snap.savings}`,
      `investing=${snap.investing}`,
      `leftover=${snap.leftover}`,
      `leftToBudget=${snap.leftToBudget}`,
      `goals=${profile.goals.map((g) => `${g.name}:${g.current}/${g.target}`).join(";")}`,
      `debts=${profile.debts.map((d) => `${d.name}:${d.balance}@${d.ratePct}`).join(";")}`,
      `assets=${JSON.stringify(profile.assets)}`,
    ].join("\n");
    const asked = question.trim();
    try {
      const res = await getAiTip({ data: { lang, snapshot, question: asked || undefined } });
      if (res.ok) useAppStore.getState().setAiTip(res.text, "grok");
      else {
        setErr(t(lang, "budget.aiUnavailable"));
        if (asked) {
          useAppStore.getState().setAiTip(
            answerBudgetQuestion(asked, {
              netIncome: snap.income,
              essentialExpenses: snap.essential,
              flexibleExpenses: snap.flexible,
              savings: snap.savings,
              investments: snap.investing,
              debts: health.totalLiabilities,
              netWorth: health.netWorth,
              liquidityMonths: health.ratios.find((r) => r.key === "liquidity")?.value ?? 0,
              savingsInvestmentRate: health.ratios.find((r) => r.key === "savInvRate")?.value ?? 0,
              leftToBudget: snap.leftToBudget,
              leftover: snap.leftover,
            }, lang),
            "ask",
          );
        } else localTip();
      }
    } catch {
      setErr(t(lang, "budget.aiUnavailable"));
      if (asked) {
        useAppStore.getState().setAiTip(
          answerBudgetQuestion(asked, {
            netIncome: snap.income,
            essentialExpenses: snap.essential,
            flexibleExpenses: snap.flexible,
            savings: snap.savings,
            investments: snap.investing,
            debts: health.totalLiabilities,
            netWorth: health.netWorth,
            liquidityMonths: health.ratios.find((r) => r.key === "liquidity")?.value ?? 0,
            savingsInvestmentRate: health.ratios.find((r) => r.key === "savInvRate")?.value ?? 0,
            leftToBudget: snap.leftToBudget,
            leftover: snap.leftover,
          }, lang),
          "ask",
        );
      } else localTip();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Panel fold="tips" foldTitle={t(lang, "budget.aiTitle")} accent="tools">
      <p className="text-sm text-muted">{t(lang, "budget.aiHint")}</p>
      <p className="mt-3 text-sm leading-relaxed">
        {loading
          ? t(lang, "budget.aiLoading")
          : profile.aiTip || t(lang, "budget.aiEmpty")}
      </p>
      {err ? <p className="mt-2 text-xs text-danger">{err}</p> : null}
      <div className="mt-4">
        <Label htmlFor="ai-q">{t(lang, "budget.aiAsk")}</Label>
        <Input
          id="ai-q"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t(lang, "budget.aiAskPh")}
        />
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1" onClick={localTip} disabled={loading}>
          <Repeat className="size-4" />
          {t(lang, "budget.aiCta")}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={grokTip} disabled={loading}>
          {question.trim() ? t(lang, "budget.aiAskBtn") : t(lang, "budget.askGrok")}
        </Button>
      </div>
    </Panel>
  );
}

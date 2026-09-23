import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  calculate,
  FREQ_KEYS,
  type CalcMode,
  type CalcResult,
  type FreqKey,
  type Timing,
} from "@/lib/compound";
import { t, INTL_LOCALE, type Lang } from "@/lib/i18n";
import { formatMoney, formatPct, currencySymbol } from "@/lib/money";
import { useAppStore } from "@/lib/store";

const MODE_KEYS: Record<CalcMode, string> = {
  save: "calc.modeSave",
  time: "calc.modeTime",
  pmt: "calc.modePmt",
  rate: "calc.modeRate",
};

const MODES_LIST: CalcMode[] = ["save", "time", "pmt", "rate"];

const FREQ_LONG: Record<FreqKey, string> = {
  weekly: "calc.freqWeekly",
  biweekly: "calc.freqBiweekly",
  monthly: "calc.freqMonthly",
  quarterly: "calc.freqQuarterly",
  annually: "calc.freqAnnually",
};
const FREQ_SHORT: Record<FreqKey, string> = {
  weekly: "calc.freqShortWeekly",
  biweekly: "calc.freqShortBiweekly",
  monthly: "calc.freqShortMonthly",
  quarterly: "calc.freqShortQuarterly",
  annually: "calc.freqShortAnnually",
};

export function CalculatorView({ embedded = false }: { embedded?: boolean }) {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const calc = useAppStore((s) => s.calc);
  const setCalc = useAppStore((s) => s.setCalc);
  const [result, setResult] = useState<CalcResult | { ok: false; error: string } | null>(() =>
    calculate(calc),
  );
  const [error, setError] = useState<string | null>(null);
  const sym = currencySymbol(currency);

  function run() {
    const out = calculate(calc);
    if (!out.ok) {
      setError(t(lang, "calc.unreachable"));
      setResult(out);
      return;
    }
    setError(null);
    setResult(out);
  }

  return (
    <div className={embedded ? "w-full" : "mx-auto w-full max-w-lg md:max-w-3xl"}>
      {embedded ? null : (
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "nav.calculator")}</h1>
          <p className="mt-1 text-sm text-muted">{t(lang, "budget.invCalcHint")}</p>
        </header>
      )}
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <NativeSelect
          className="h-12 bg-field text-field-fg"
          value={calc.mode}
          onChange={(e) => setCalc({ mode: e.target.value as CalcMode })}
          aria-label={t(lang, "calc.modeSave")}
        >
          {MODES_LIST.map((m) => (
            <option key={m} value={m}>
              {t(lang, MODE_KEYS[m])}
            </option>
          ))}
        </NativeSelect>

        {calc.mode !== "save" ? (
          <MoneyField
            label={t(lang, "calc.goal")}
            symbol={sym}
            value={calc.goal}
            onChange={(n) => setCalc({ goal: n })}
          />
        ) : null}

        <MoneyField
          label={t(lang, "calc.principal")}
          symbol={sym}
          value={calc.principal}
          onChange={(n) => setCalc({ principal: n })}
        />

        {calc.mode === "pmt" ? (
          <div>
            <Label>{t(lang, "calc.freq")}</Label>
            <NativeSelect
              className="h-12 bg-field text-field-fg"
              value={calc.freq}
              onChange={(e) => setCalc({ freq: e.target.value as FreqKey })}
            >
              {FREQ_KEYS.map((k) => (
                <option key={k} value={k}>
                  {t(lang, FREQ_LONG[k])}
                </option>
              ))}
            </NativeSelect>
          </div>
        ) : (
          <MoneyField
            label={t(lang, "calc.pmt")}
            symbol={sym}
            value={calc.pmt}
            onChange={(n) => setCalc({ pmt: n })}
            suffix={
              <div className="w-[7.75rem] shrink-0">
                <NativeSelect
                  className="h-11 rounded-none rounded-r-[7px] bg-elevated text-fg shadow-none"
                  value={calc.freq}
                  onChange={(e) => setCalc({ freq: e.target.value as FreqKey })}
                >
                  {FREQ_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {t(lang, FREQ_SHORT[k])}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            }
          />
        )}

        <div>
          <Label>{t(lang, "calc.timing")}</Label>
          <NativeSelect
            className="h-12 bg-field text-field-fg"
            value={calc.timing}
            onChange={(e) => setCalc({ timing: e.target.value as Timing })}
          >
            <option value="begin">{t(lang, "calc.timingBegin")}</option>
            <option value="end">{t(lang, "calc.timingEnd")}</option>
          </NativeSelect>
        </div>

        {calc.mode !== "rate" ? (
          <PercentField
            label={t(lang, "calc.rate")}
            value={calc.annualRatePct}
            onChange={(n) => setCalc({ annualRatePct: n })}
          />
        ) : null}

        {calc.mode !== "time" ? (
          <div>
            <Label>{t(lang, "calc.duration")}</Label>
            <div className="flex overflow-hidden rounded-sm calc-field">
              <input
                type="number"
                min={0}
                step={1}
                className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-field-fg outline-none tabular"
                value={calc.years}
                onChange={(e) => setCalc({ years: Number(e.target.value) || 0 })}
              />
              <span className="flex items-center px-4 text-sm text-field-fg/70">{t(lang, "calc.years")}</span>
            </div>
          </div>
        ) : null}

        <div className="flex pt-1 max-md:w-full">
          <Button type="submit" className="h-11 rounded-md px-5 max-md:w-full">
            {t(lang, "calc.calculate")}
          </Button>
        </div>
      </form>

      {error ? (
        <p className="mt-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      ) : null}

      {result && result.ok ? <Results result={result} lang={lang} currency={currency} goal={calc.goal} /> : null}
    </div>
  );
}

function MoneyField({
  label,
  symbol,
  value,
  onChange,
  suffix,
}: {
  label: string;
  symbol: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex rounded-sm calc-field">
        <span className="calc-addon flex items-center justify-center px-3 text-sm font-medium">{symbol}</span>
        <input
          type="number"
          min={0}
          step="0.01"
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-field-fg outline-none tabular"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        {suffix}
      </div>
    </div>
  );
}

function PercentField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex overflow-hidden rounded-sm calc-field">
        <input
          type="number"
          min={0}
          step="0.001"
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-field-fg outline-none tabular"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        <span className="calc-addon flex items-center justify-center px-3 text-sm font-medium">%</span>
      </div>
    </div>
  );
}

function Results({
  result,
  lang,
  currency,
  goal,
}: {
  result: CalcResult;
  lang: Lang;
  currency: string;
  goal: number;
}) {
  const money = (n: number) => formatMoney(n, currency, lang);
  const freqWord = t(lang, FREQ_SHORT[result.freq]).toLowerCase();
  const duration =
    result.years >= 1
      ? `${new Intl.NumberFormat(INTL_LOCALE[lang] ?? "en-US", { maximumFractionDigits: 1 }).format(result.years)} ${t(lang, result.years === 1 ? "calc.year" : "calc.yearsWord")}`
      : `${Math.round(result.years * 12)} ${t(lang, "calc.monthsWord")}`;

  let headline = t(lang, "calc.youCanSave");
  let big = money(result.finalBalance);
  let sub = t(lang, "calc.savingLine", { pmt: money(result.pmt), freq: freqWord, duration });

  if (result.mode === "rate") {
    headline = t(lang, "calc.needRate");
    big = formatPct(result.rateNeeded ?? 0, lang, 3);
    sub = t(lang, "calc.toReach", { goal: money(goal) });
  } else if (result.mode === "pmt") {
    headline = t(lang, "calc.needSave");
    big = money(result.pmtNeeded ?? result.pmt);
    sub = t(lang, "calc.eachPeriod", { goal: money(goal), duration });
  } else if (result.mode === "time") {
    headline = t(lang, "calc.itWillTake");
    const y = Math.floor(result.yearsNeeded ?? result.years);
    const mo = result.monthsRemainder ?? 0;
    const parts: string[] = [];
    if (y > 0) parts.push(`${y} ${t(lang, y === 1 ? "calc.year" : "calc.yearsWord")}`);
    if (mo > 0) parts.push(`${mo} ${t(lang, mo === 1 ? "calc.month" : "calc.monthsWord")}`);
    big = parts.join(` ${t(lang, "calc.and")} `) || `0 ${t(lang, "calc.monthsWord")}`;
    sub = t(lang, "calc.toReachGoal", { goal: money(goal) });
  }

  const pie = [
    { name: t(lang, "calc.initial"), value: Math.max(0, result.principal), color: "#6E7BFF" },
    { name: t(lang, "calc.periodic"), value: Math.max(0, result.totalPeriodic), color: "#13C636" },
    { name: t(lang, "calc.interest"), value: Math.max(0, result.totalInterest), color: "#F5A623" },
  ].filter((p) => p.value > 0.004);

  const bars = result.rows.map((r) => ({
    year: r.year,
    principal: result.principal,
    deposits: Math.max(0, r.totalDeposits - result.principal),
    interest: Math.max(0, r.totalInterest),
  }));

  return (
    <section className="mt-8 overflow-hidden rounded-xl border border-primary/40 bg-card p-5 md:p-6">
      <p className="text-muted">{headline}</p>
      <p className="mt-1 text-4xl font-semibold tracking-tight tabular md:text-5xl">{big}</p>
      <p className="mt-2 text-sm text-muted">{sub}</p>
      <div className="my-5 h-px bg-border" />
      <ul className="space-y-2 text-sm">
        {pie.map((p) => (
          <li key={p.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span className="size-3 rounded-sm" style={{ background: p.color }} />
              <span className="text-muted">{p.name}:</span>
            </span>
            <span className="tabular">{money(p.value)}</span>
          </li>
        ))}
      </ul>
      <div className="mx-auto mt-4 h-64 w-full max-w-sm">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pie}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              stroke="var(--color-bg)"
              strokeWidth={2}
              label={false}
              labelLine={false}
              isAnimationActive={false}
            >
              {pie.map((p) => (
                <Cell key={p.name} fill={p.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v) => money(Number(v))}
              contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 rounded-lg border border-primary/30 p-3">
        <div className="mb-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted">
          {pie.map((p) => (
            <span key={p.name} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm" style={{ background: p.color }} />
              {p.name}
            </span>
          ))}
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
              <XAxis
                dataKey="year"
                tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                interval={bars.length > 8 ? 1 : 0}
              />
              <Tooltip
                formatter={(v) => money(Number(v))}
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }}
              />
              <Bar dataKey="principal" stackId="a" fill="var(--color-chart-1)" isAnimationActive={false} />
              <Bar dataKey="deposits" stackId="a" fill="var(--color-chart-2)" isAnimationActive={false} />
              <Bar dataKey="interest" stackId="a" fill="var(--color-chart-3)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">{t(lang, "calc.tableYear")}</th>
              <th className="px-3 py-2 font-medium">{t(lang, "calc.tablePeriodic")}</th>
              <th className="px-3 py-2 font-medium">{t(lang, "calc.tableTotalDep")}</th>
              <th className="px-3 py-2 font-medium">{t(lang, "calc.tableInterest")}</th>
              <th className="px-3 py-2 font-medium">{t(lang, "calc.tableBalance")}</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.year} className="border-b border-border/70 last:border-0">
                <td className="px-3 py-2 tabular">{row.year}</td>
                <td className="px-3 py-2 tabular">{money(row.periodDeposits)}</td>
                <td className="px-3 py-2 tabular">{money(row.totalDeposits)}</td>
                <td className="px-3 py-2 tabular">{money(row.totalInterest)}</td>
                <td className="px-3 py-2 tabular">{money(row.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

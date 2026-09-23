import { useMemo, useState } from "react";
import { Pause, Pencil, Play, Plus, Repeat, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Fold, Panel } from "@/components/finance/panel";
import { AmountExprInput } from "@/components/finance/amount-expr";
import { MethodSelect } from "@/components/finance/method-select";
import { planPaydown } from "@/lib/debt";
import { simulate } from "@/lib/compound";
import { t, type Lang } from "@/lib/i18n";
import { formatMoney } from "@/lib/money";
import { installmentOf, largeProgress, FREQ_LABEL, RECURRING_FREQS, allocI18nKey } from "@/lib/budget";
import { useAppStore, useProfile, type AllocKey, type CategoryId } from "@/lib/store";
import type { RecurringFreq } from "@/lib/types";

export function LargePurchasesCard() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const profile = useProfile();
  const month = useAppStore((s) => s.activeMonth);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [total, setTotal] = useState(0);
  const [months, setMonths] = useState(6);
  const [monthsText, setMonthsText] = useState<string | null>(null);
  const [category, setCategory] = useState<AllocKey>("essential");
  const [fundFromGoalId, setFundFromGoalId] = useState("");
  const [methodId, setMethodId] = useState("");
  const monthsShown = monthsText ?? String(months);
  const monthsLive = monthsText === "" ? 0 : Number(monthsShown) || 0;
  const installment = monthsLive > 0 && total > 0 ? total / monthsLive : 0;
  const fundGoal = profile.goals.find((g) => g.id === fundFromGoalId);

  function resetForm() {
    setEditingId(null);
    setName("");
    setTotal(0);
    setMonths(6);
    setMonthsText(null);
    setCategory("essential");
    setFundFromGoalId("");
    setMethodId("");
  }

  function openAdd() {
    resetForm();
    setOpen(true);
  }

  function openEdit(id: string) {
    const lp = profile.largePurchases.find((x) => x.id === id);
    if (!lp) return;
    setEditingId(id);
    setName(lp.name);
    setTotal(lp.total);
    setMonths(lp.months);
    setMonthsText(null);
    setCategory(lp.category ?? "essential");
    setFundFromGoalId(lp.fundFromGoalId ?? "");
    setMethodId(lp.methodId ?? "");
    setOpen(true);
  }

  return (
    <Panel fold="large" foldTitle={t(lang, "budget.largePurchases")} accent="commit">
      <h2 className="fold-title text-lg font-semibold">{t(lang, "budget.largePurchases")}</h2>
      <p className="mt-1 text-sm text-muted">{t(lang, "budget.largeHintSelf")}</p>
      {profile.largePurchases.length === 0 ? (
        <p className="py-8 text-center text-sm text-subtle">{t(lang, "budget.noLarge")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {profile.largePurchases.map((lp) => {
            const prog = largeProgress(lp, month);
            const pct = lp.months > 0 ? (prog.dueCount / lp.months) * 100 : 0;
            return (
              <li key={lp.id} className="rounded-md bg-elevated px-3 py-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openEdit(lp.id)}>
                    <p className="font-medium">{lp.name}</p>
                    <p className="text-xs text-muted">
                      {t(
                        lang,
                        `budget.${lp.category === "savings" ? "goals" : lp.category === "debt" ? "debtAlloc" : lp.category}`,
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {formatMoney(installmentOf(lp), currency, lang)} × {lp.months}
                    </p>
                    {lp.fundFromGoalId ? (
                      <p className="text-xs text-muted">
                        {t(lang, "budget.fundedFrom", {
                          name: profile.goals.find((g) => g.id === lp.fundFromGoalId)?.name ?? "—",
                        })}
                        {" · "}
                        {t(lang, "budget.repayProgress", {
                          paid: formatMoney(lp.total - prog.remaining, currency, lang),
                          total: formatMoney(lp.total, currency, lang),
                        })}
                      </p>
                    ) : null}
                  </button>
                  <span className="flex shrink-0 items-center">
                    <button
                      type="button"
                      onClick={() => openEdit(lp.id)}
                      className="flex size-11 items-center justify-center text-muted hover:text-fg"
                      aria-label={t(lang, "common.edit")}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => useAppStore.getState().removeLarge(lp.id)}
                      className="flex size-11 items-center justify-center text-muted hover:text-danger"
                      aria-label={t(lang, "common.delete")}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </span>
                </div>
                <Progress value={pct} className="my-2" />
                <p className="text-xs text-muted">
                  {prog.completed
                    ? t(lang, "budget.largeDone")
                    : prog.active
                      ? t(lang, "budget.monthOf", { n: prog.index + 1, total: lp.months })
                      : t(lang, "budget.notStarted")}
                  {" · "}
                  {t(lang, "budget.remaining")}: {formatMoney(prog.remaining, currency, lang)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
      <Button variant="secondary" className="mt-3 w-full" onClick={openAdd}>
        <Plus className="size-4" /> {t(lang, "budget.addLarge")}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) resetForm();
        }}
      >
        <DialogContent title={editingId ? t(lang, "budget.editLarge") : t(lang, "budget.addLarge")}>
          <div className="space-y-3">
            <div>
              <Label>{t(lang, "budget.largeCategory")}</Label>
              <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as AllocKey)}>
                <option value="essential">{t(lang, "budget.essential")}</option>
                <option value="flexible">{t(lang, "budget.flexible")}</option>
                <option value="investing">{t(lang, "budget.investing")}</option>
                <option value="savings">{t(lang, "budget.goals")}</option>
                <option value="debt">{t(lang, "budget.debtAlloc")}</option>
              </NativeSelect>
            </div>
            <div>
              <Label>{t(lang, "budget.name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t(lang, "budget.largeNamePh")} />
            </div>
            <div>
              <Label>{t(lang, "budget.total")}</Label>
              <AmountExprInput key={editingId ?? "new-large"} value={total} onValue={setTotal} />
              <p className="mt-1 text-xs text-subtle">{t(lang, "budget.amountExprHint")}</p>
            </div>
            <div>
              <Label>{t(lang, "budget.monthsSplit")}</Label>
              <Input
                type="text"
                inputMode="numeric"
                min={1}
                value={monthsShown}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^\d]/g, "");
                  setMonthsText(raw);
                  if (raw === "") return;
                  const n = Number(raw);
                  if (n >= 1) setMonths(n);
                }}
                onBlur={() => {
                  if (!monthsText || Number(monthsText) < 1) setMonths(Math.max(1, months) || 1);
                  setMonthsText(null);
                }}
              />
            </div>
            {installment > 0 ? (
              <p className="rounded-md bg-elevated px-3 py-2 text-xs text-muted">
                {t(lang, "budget.perMonthPreview", {
                  amount: formatMoney(installment, currency, lang),
                  n: monthsLive || months,
                })}
              </p>
            ) : null}
            {profile.goals.length > 0 ? (
              <div>
                <Label>{t(lang, "budget.fundFrom")}</Label>
                <NativeSelect value={fundFromGoalId} onChange={(e) => setFundFromGoalId(e.target.value)}>
                  <option value="">{t(lang, "budget.fundFromNone")}</option>
                  {profile.goals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({formatMoney(g.current, currency, lang)})
                    </option>
                  ))}
                </NativeSelect>
                <p className="mt-1 text-xs text-muted">{t(lang, "budget.fundFromHint")}</p>
                {!editingId && fundGoal && total > 0 ? (
                  <p className="mt-1 text-xs text-muted">
                    {fundGoal.name}: {formatMoney(fundGoal.current, currency, lang)} →{" "}
                    {formatMoney(fundGoal.current - total, currency, lang)}
                  </p>
                ) : null}
              </div>
            ) : null}
            <MethodSelect value={methodId} onChange={setMethodId} />
            <Button
              className="w-full"
              onClick={() => {
                if (!name.trim() || total <= 0) return;
                if (editingId) {
                  useAppStore.getState().updateLarge(editingId, {
                    name: name.trim(),
                    total,
                    months: Math.max(1, months),
                    category,
                    fundFromGoalId: fundFromGoalId || undefined,
                    methodId: methodId || undefined,
                  });
                } else {
                  useAppStore.getState().addLarge({
                    name: name.trim(),
                    total,
                    months: Math.max(1, months),
                    startMonth: month,
                    category,
                    fundFromGoalId: fundFromGoalId || undefined,
                    methodId: methodId || undefined,
                  });
                }
                resetForm();
                setOpen(false);
              }}
            >
              {t(lang, "budget.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

export function RecurringCard() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const profile = useProfile();
  const month = useAppStore((s) => s.activeMonth);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<CategoryId>("essential");
  const [freq, setFreq] = useState<RecurringFreq>("monthly");
  const [payMethodId, setPayMethodId] = useState("");
  const suggestions = profile.recurringMemory ?? [];

  function openAdd() {
    setEditingId(null);
    setName("");
    setAmount(0);
    setCategory("essential");
    setFreq("monthly");
    setPayMethodId("");
    setOpen(true);
  }

  function openEdit(id: string) {
    const r = profile.recurring.find((x) => x.id === id);
    if (!r) return;
    setEditingId(id);
    setName(r.name);
    setAmount(r.amount);
    setCategory(r.category);
    setFreq(r.frequency ?? "monthly");
    setPayMethodId(r.methodId ?? "");
    setOpen(true);
  }

  return (
    <Panel fold="recurring" foldTitle={t(lang, "budget.recurring")} accent="commit">
      <p className="text-sm text-muted">{t(lang, "budget.recurringAutoHint")}</p>
      {profile.recurring.length === 0 ? (
        <p className="py-8 text-center text-sm text-subtle">{t(lang, "budget.noRecurring")}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {profile.recurring.map((r) => {
            const paused = r.active === false;
            const skipped = r.skippedMonths?.includes(month);
            return (
              <li key={r.id} className="rounded-md bg-elevated px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className={paused ? "text-muted line-through" : ""}>
                      {r.name} <span className="text-muted">· {formatMoney(r.amount, currency, lang)}</span>
                    </span>
                    <span className="mt-0.5 block text-[0.65rem] uppercase tracking-wide text-muted">
                      {t(lang, FREQ_LABEL[r.frequency ?? "monthly"])}
                      {" · "}
                      {paused
                        ? t(lang, "budget.paused")
                        : skipped
                          ? t(lang, "budget.skipped")
                          : t(lang, "budget.appliedAuto")}
                    </span>
                  </span>
                  <span className="flex items-center">
                    <button
                      type="button"
                      onClick={() => openEdit(r.id)}
                      className="flex size-11 items-center justify-center text-muted hover:text-fg"
                      aria-label={t(lang, "common.edit")}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => useAppStore.getState().toggleRecurring(r.id, paused)}
                      className="flex size-11 items-center justify-center text-muted hover:text-fg"
                      aria-label={paused ? t(lang, "budget.resume") : t(lang, "budget.pause")}
                    >
                      {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => useAppStore.getState().removeRecurring(r.id)}
                      className="flex size-11 items-center justify-center text-muted hover:text-danger"
                      aria-label={t(lang, "common.delete")}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Button variant="secondary" className="mt-3 w-full" onClick={openAdd}>
        <Plus className="size-4" /> {t(lang, "budget.addRecurring")}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditingId(null);
        }}
      >
        <DialogContent title={editingId ? t(lang, "budget.editRecurring") : t(lang, "budget.addRecurring")}>
          <div className="space-y-3">
            {!editingId && suggestions.length > 0 ? (
              <div>
                <p className="mb-1.5 text-xs text-muted">{t(lang, "budget.suggestions")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.slice(0, 8).map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      className="rounded-full bg-elevated px-3 py-1 text-xs hover:bg-card"
                      onClick={() => {
                        setName(s.name);
                        setAmount(s.amount);
                        setCategory(s.category);
                      }}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <Label>{t(lang, "budget.name")}</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                list="recurring-suggestions"
                autoComplete="off"
              />
              <datalist id="recurring-suggestions">
                {suggestions.map((s) => (
                  <option key={s.name} value={s.name} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>{t(lang, "budget.total")}</Label>
              <AmountExprInput key={editingId ?? "new-recurring"} value={amount} onValue={setAmount} />
              <p className="mt-1 text-xs text-subtle">{t(lang, "budget.amountExprHint")}</p>
            </div>
            <div>
              <Label>{t(lang, "budget.category")}</Label>
              <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
                <option value="essential">{t(lang, "budget.essential")}</option>
                <option value="investing">{t(lang, "budget.investing")}</option>
                <option value="flexible">{t(lang, "budget.flexible")}</option>
              </NativeSelect>
            </div>
            <div>
              <Label>{t(lang, "budget.frequency")}</Label>
              <NativeSelect value={freq} onChange={(e) => setFreq(e.target.value as RecurringFreq)}>
                {RECURRING_FREQS.map((f) => (
                  <option key={f} value={f}>
                    {t(lang, FREQ_LABEL[f])}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <MethodSelect value={payMethodId} onChange={setPayMethodId} />
            <Button
              className="w-full"
              onClick={() => {
                if (!name.trim()) return;
                if (editingId) {
                  useAppStore.getState().updateRecurring(editingId, {
                    name: name.trim(),
                    amount,
                    category,
                    frequency: freq,
                    methodId: payMethodId || undefined,
                  });
                } else {
                  useAppStore.getState().addRecurring({
                    name: name.trim(),
                    amount,
                    category,
                    frequency: freq,
                    startMonth: month,
                    methodId: payMethodId || undefined,
                  });
                }
                setName("");
                setAmount(0);
                setFreq("monthly");
                setEditingId(null);
                setOpen(false);
              }}
            >
              {t(lang, "budget.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

export function InvestmentCalcCard() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const [principal, setPrincipal] = useState(0);
  const [pmt, setPmt] = useState(0);
  const [rate, setRate] = useState(10);
  const [years, setYears] = useState(10);
  const rows = useMemo(
    () =>
      simulate({
        principal,
        pmt,
        annualRatePct: rate,
        years,
        periodsPerYear: 12,
        timing: "end",
      }),
    [principal, pmt, rate, years],
  );
  const show = principal > 0 || pmt > 0;
  const last = rows[rows.length - 1];
  return (
    <Panel fold="invcalc" foldTitle={t(lang, "budget.invCalc")} accent="tools">
      <p className="text-sm text-muted">{t(lang, "budget.invCalcHint")}</p>
      <div className="mt-4 space-y-3">
        <NumField label={t(lang, "budget.initialInv")} suffix={currency} value={principal} onChange={setPrincipal} />
        <NumField label={t(lang, "budget.monthlyContrib")} suffix={currency} value={pmt} onChange={setPmt} />
        <NumField label={t(lang, "budget.annualRate")} suffix="%" value={rate} onChange={setRate} />
        <div>
          <p className="mb-1 text-sm">
            {t(lang, "budget.invPeriod")}: {years}
          </p>
          <Slider min={1} max={40} step={1} value={[years]} onValueChange={(v) => setYears(v[0] ?? 10)} />
        </div>
      </div>
      {!show ? (
        <p className="mt-4 rounded-md bg-elevated px-3 py-3 text-sm text-muted">{t(lang, "budget.invEmpty")}</p>
      ) : (
        <div className="mt-4">
          <p className="mb-2 text-sm text-muted">
            {t(lang, "budget.finalBalance")}:{" "}
            <span className="font-semibold text-fg tabular">{formatMoney(last?.balance ?? 0, currency, lang)}</span>
          </p>
          <div className="h-40 min-w-0 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <XAxis dataKey="year" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(v) => formatMoney(Number(v), currency, lang)}
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
                />
                <Bar dataKey="balance" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </Panel>
  );
}

function NumField({
  label,
  suffix,
  value,
  onChange,
}: {
  label: string;
  suffix: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex overflow-hidden rounded-md bg-elevated card-shadow">
        <input
          type="number"
          className="h-11 min-w-0 flex-1 bg-transparent px-3 text-sm tabular outline-none"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
        />
        <span className="flex items-center px-3 text-xs text-muted">{suffix}</span>
      </div>
    </div>
  );
}

export function DebtCard() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState(0);
  const [rate, setRate] = useState(5);
  const [min, setMin] = useState(0);
  const [category, setCategory] = useState<AllocKey>("essential");
  const [payMethodId, setPayMethodId] = useState("");
  const avalanche = useMemo(
    () => planPaydown(profile.debts, profile.extraDebtPayment, "avalanche"),
    [profile.debts, profile.extraDebtPayment],
  );
  const snowball = useMemo(
    () => planPaydown(profile.debts, profile.extraDebtPayment, "snowball"),
    [profile.debts, profile.extraDebtPayment],
  );
  const method = profile.debtMethod;
  const plan = method === "avalanche" ? avalanche : snowball;
  const other = method === "avalanche" ? snowball : avalanche;
  const interestDelta = other.totalInterest - plan.totalInterest;
  const monthsDelta = other.months - plan.months;

  function openAdd() {
    setEditingId(null);
    setName("");
    setBalance(0);
    setRate(5);
    setMin(0);
    setCategory("essential");
    setPayMethodId("");
    setOpen(true);
  }

  function openEdit(id: string) {
    const d = profile.debts.find((x) => x.id === id);
    if (!d) return;
    setEditingId(id);
    setName(d.name);
    setBalance(d.balance);
    setRate(d.ratePct);
    setMin(d.minPayment);
    setCategory(d.category ?? "essential");
    setPayMethodId(d.methodId ?? "");
    setOpen(true);
  }

  return (
    <Panel fold="debt" foldTitle={t(lang, "budget.debt")} accent="debt">
      <p className="text-sm text-muted">{t(lang, "budget.debtHint")}</p>
      <div className="mt-4 space-y-3">
        <Fold title={t(lang, "budget.yourDebts")} defaultOpen>
          {profile.debts.length === 0 ? (
            <p className="py-4 text-center text-sm text-subtle">{t(lang, "budget.noDebts")}</p>
          ) : (
            <>
              <ul className="space-y-2 md:hidden">
                {profile.debts.map((d) => (
                  <li key={d.id} className="rounded-md bg-card px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <button type="button" className="min-w-0 flex-1 py-1 text-left" onClick={() => openEdit(d.id)}>
                        <p className="font-medium">{d.name}</p>
                        <p className="text-xs text-muted">
                          {t(lang, allocI18nKey(d.category))}
                          {" · "}
                          {t(lang, "budget.debtMin")} {formatMoney(d.minPayment, currency, lang)}
                        </p>
                        <p className="mt-0.5 text-xs text-muted tabular">
                          {formatMoney(d.balance, currency, lang)} · {d.ratePct}%
                        </p>
                      </button>
                      <span className="flex shrink-0">
                        <button
                          type="button"
                          onClick={() => openEdit(d.id)}
                          className="flex size-11 items-center justify-center text-muted hover:text-fg"
                          aria-label={t(lang, "common.edit")}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => useAppStore.getState().removeDebt(d.id)}
                          className="flex size-11 items-center justify-center text-muted hover:text-danger"
                          aria-label={t(lang, "common.delete")}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-xs">
                  <thead className="text-muted">
                    <tr>
                      <th className="py-1 font-medium">{t(lang, "budget.debtName")}</th>
                      <th className="py-1 font-medium">{t(lang, "budget.category")}</th>
                      <th className="py-1 font-medium">{t(lang, "budget.debtBalance")}</th>
                      <th className="py-1 font-medium">{t(lang, "budget.debtRate")}</th>
                      <th className="py-1 font-medium">{t(lang, "budget.debtMin")}</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {profile.debts.map((d) => (
                      <tr key={d.id} className="border-t border-border">
                        <td className="py-2">{d.name}</td>
                        <td className="py-2 text-muted">{t(lang, allocI18nKey(d.category))}</td>
                        <td className="tabular">{formatMoney(d.balance, currency, lang)}</td>
                        <td className="tabular">{d.ratePct}%</td>
                        <td className="tabular">{formatMoney(d.minPayment, currency, lang)}</td>
                        <td>
                          <span className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => openEdit(d.id)}
                              className="flex size-11 items-center justify-center text-muted hover:text-fg"
                              aria-label={t(lang, "common.edit")}
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => useAppStore.getState().removeDebt(d.id)}
                              className="flex size-11 items-center justify-center text-muted hover:text-danger"
                              aria-label={t(lang, "common.delete")}
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={openAdd}>
            <Plus className="size-4" /> {t(lang, "budget.addDebt")}
          </Button>
        </Fold>
        <Fold title={t(lang, "budget.strategy")} defaultOpen>
          <Label>{t(lang, "budget.payoffMethod")}</Label>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <MethodButton
              active={method === "avalanche"}
              title={t(lang, "budget.avalanche")}
              subtitle={t(lang, "budget.avalancheHint")}
              onClick={() => useAppStore.getState().setDebtMethod("avalanche")}
            />
            <MethodButton
              active={method === "snowball"}
              title={t(lang, "budget.snowball")}
              subtitle={t(lang, "budget.snowballHint")}
              onClick={() => useAppStore.getState().setDebtMethod("snowball")}
            />
          </div>
          {profile.debts.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <PlanPreview
                label={t(lang, "budget.avalanche")}
                plan={avalanche}
                active={method === "avalanche"}
                currency={currency}
                lang={lang}
                onClick={() => useAppStore.getState().setDebtMethod("avalanche")}
              />
              <PlanPreview
                label={t(lang, "budget.snowball")}
                plan={snowball}
                active={method === "snowball"}
                currency={currency}
                lang={lang}
                onClick={() => useAppStore.getState().setDebtMethod("snowball")}
              />
            </div>
          ) : null}
          <Label className="mt-3">{t(lang, "budget.extraPayment")}</Label>
          <div className="flex overflow-hidden rounded-md bg-card card-shadow">
            <AmountExprInput
              className="h-11 min-w-0 flex-1 rounded-none bg-transparent"
              value={profile.extraDebtPayment}
              onValue={(n) => useAppStore.getState().setExtraPayment(n)}
            />
            <span className="flex items-center px-3 text-xs text-muted">{currency}</span>
          </div>
          <p className="mt-1 text-xs text-muted">{t(lang, "budget.extraHint")}</p>
        </Fold>
        <Fold title={t(lang, "budget.paydownPlan")} defaultOpen>
          {profile.debts.length === 0 ? (
            <p className="py-4 text-center text-sm text-subtle">{t(lang, "budget.noDebts")}</p>
          ) : (
            <div className="text-sm">
              <p className="font-medium">
                {plan.debtFree
                  ? t(lang, "budget.debtFreeIn", { months: plan.months })
                  : t(lang, "budget.debtNotRetired")}
              </p>
              <p className="mt-1 text-muted">
                {t(lang, "budget.extraGoesTo")}: <span className="text-fg">{plan.schedule[0]?.extraTo ?? "—"}</span>
              </p>
              <p className="mt-1 text-muted">
                {t(lang, "budget.interestPaid")}: {formatMoney(plan.totalInterest, currency, lang)}
              </p>
              <p className="mt-1 text-muted">
                {t(lang, "budget.totalPaid")}: {formatMoney(plan.totalPaid, currency, lang)}
              </p>
              <p className="mt-1 text-success">
                {t(lang, "budget.interestSaved")}: {formatMoney(plan.interestSaved, currency, lang)}
              </p>
              {interestDelta > 1 ? (
                <p className="mt-2 rounded-md bg-success/10 px-3 py-2 text-xs text-success">
                  {t(lang, "budget.cheaperBy", { amount: formatMoney(interestDelta, currency, lang) })}
                  {monthsDelta > 0 ? ` · ${t(lang, "budget.fasterBy", { n: monthsDelta })}` : ""}
                </p>
              ) : Math.abs(interestDelta) <= 1 ? (
                <p className="mt-2 text-xs text-muted">{t(lang, "budget.samePlan")}</p>
              ) : null}
              <div className="mt-4 h-48 min-w-0 overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={Array.from(
                      { length: Math.max(avalanche.schedule.length, snowball.schedule.length) },
                      (_, i) => ({
                        month: i + 1,
                        avalanche: avalanche.schedule[i]?.remaining ?? 0,
                        snowball: snowball.schedule[i]?.remaining ?? 0,
                      }),
                    )}
                  >
                    <CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: "var(--color-muted)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                      tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(v, name) => [
                        formatMoney(Number(v), currency, lang),
                        name === "avalanche" ? t(lang, "budget.avalanche") : t(lang, "budget.snowball"),
                      ]}
                      contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="avalanche"
                      stroke="var(--color-primary)"
                      fill="var(--color-primary)"
                      fillOpacity={method === "avalanche" ? 0.25 : 0.08}
                      strokeWidth={method === "avalanche" ? 2.5 : 1.5}
                      isAnimationActive={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="snowball"
                      stroke="var(--color-warning)"
                      fill="var(--color-warning)"
                      fillOpacity={method === "snowball" ? 0.25 : 0.08}
                      strokeWidth={method === "snowball" ? 2.5 : 1.5}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-1 flex justify-center gap-4 text-[0.65rem] text-muted">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-sm bg-primary" />
                  {t(lang, "budget.avalanche")}
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-sm bg-warning" />
                  {t(lang, "budget.snowball")}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted">{t(lang, "budget.fullSchedule", { n: plan.schedule.length })}</p>
              <ul className="mt-2 max-h-80 space-y-1 overflow-auto text-xs">
                {plan.schedule.map((m) => (
                  <li key={m.month} className="flex justify-between rounded bg-card px-2 py-1">
                    <span>
                      {m.label}
                      {m.extraTo ? ` → ${m.extraTo}` : ""}
                    </span>
                    <span className="tabular">{formatMoney(m.remaining, currency, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Fold>
      </div>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditingId(null);
        }}
      >
        <DialogContent title={editingId ? t(lang, "budget.editDebt") : t(lang, "budget.addDebt")}>
          <div className="space-y-3">
            <div>
              <Label>{t(lang, "budget.largeCategory")}</Label>
              <NativeSelect
                value={category}
                onChange={(e) => setCategory(e.target.value as AllocKey)}
                aria-label={t(lang, "budget.largeCategory")}
              >
                <option value="essential">{t(lang, "budget.essential")}</option>
                <option value="flexible">{t(lang, "budget.flexible")}</option>
                <option value="investing">{t(lang, "budget.investing")}</option>
                <option value="savings">{t(lang, "budget.goals")}</option>
                <option value="debt">{t(lang, "budget.debtAlloc")}</option>
              </NativeSelect>
              {min > 0 ? (
                <p className="mt-1 rounded-md bg-elevated px-3 py-2 text-xs text-muted">
                  {t(lang, "budget.debtMinPreview", {
                    amount: formatMoney(min, currency, lang),
                    category: t(lang, allocI18nKey(category)),
                  })}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted">{t(lang, "budget.debtCategoryHint")}</p>
              )}
            </div>
            <div>
              <Label>{t(lang, "budget.name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>{t(lang, "budget.debtBalance")}</Label>
              <AmountExprInput key={`${editingId ?? "new"}-bal`} value={balance} onValue={setBalance} />
            </div>
            <div>
              <Label>{t(lang, "budget.debtRate")}</Label>
              <Input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} />
            </div>
            <div>
              <Label>{t(lang, "budget.debtMin")}</Label>
              <AmountExprInput key={`${editingId ?? "new"}-min`} value={min} onValue={setMin} />
            </div>
            <MethodSelect value={payMethodId} onChange={setPayMethodId} />
            <Button
              className="w-full"
              onClick={() => {
                if (!name.trim()) return;
                if (editingId) {
                  useAppStore.getState().updateDebt(editingId, {
                    name: name.trim(),
                    balance,
                    ratePct: rate,
                    minPayment: min,
                    category,
                    methodId: payMethodId || undefined,
                  });
                } else {
                  useAppStore.getState().addDebt({
                    name: name.trim(),
                    balance,
                    ratePct: rate,
                    minPayment: min,
                    category,
                    methodId: payMethodId || undefined,
                  });
                }
                setName("");
                setBalance(0);
                setRate(5);
                setMin(0);
                setCategory("essential");
                setEditingId(null);
                setOpen(false);
              }}
            >
              {t(lang, "budget.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

function MethodButton({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-lg bg-primary px-3 py-3 text-left text-primary-fg"
          : "rounded-lg bg-card px-3 py-3 text-left hover:bg-elevated"
      }
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className={active ? "mt-1 text-[0.7rem] text-primary-fg/80" : "mt-1 text-[0.7rem] text-muted"}>{subtitle}</p>
    </button>
  );
}

function PlanPreview({
  label,
  plan,
  active,
  currency,
  lang,
  onClick,
}: {
  label: string;
  plan: ReturnType<typeof planPaydown>;
  active: boolean;
  currency: string;
  lang: Lang;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "rounded-lg border border-primary bg-primary/10 px-3 py-3 text-left"
          : "rounded-lg border border-border bg-card px-3 py-3 text-left"
      }
    >
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold">
        {plan.debtFree ? t(lang, "budget.monthsShort", { n: plan.months }) : "—"}
      </p>
      <p className="mt-0.5 text-xs text-muted">
        {t(lang, "budget.extraGoesTo")}: {plan.schedule[0]?.extraTo ?? "—"}
      </p>
      <p className="mt-0.5 text-xs text-muted">
        {t(lang, "budget.interestCost")}: {formatMoney(plan.totalInterest, currency, lang)}
      </p>
    </button>
  );
}

import { useState, type ReactNode } from "react";
import { Home, Landmark, Pencil, PiggyBank, Plus, ShoppingBag, Trash2, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Progress } from "@/components/ui/progress";
import { Panel, Row } from "@/components/finance/panel";
import { monthTitle } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { formatMoney, currencySymbol } from "@/lib/money";
import {
  displayItemsFor,
  extrasFor,
  FREQ_LABEL,
  installmentOf,
  isDebtActive,
  isInflowDue,
  isLargeActive,
  largeProgress,
  monthSnapshot,
  RECURRING_FREQS,
  type AllocKey,
} from "@/lib/budget";
import { evalAmountExpr } from "@/lib/expr";
import { AmountExprInput } from "@/components/finance/amount-expr";
import { MethodSelect } from "@/components/finance/method-select";
import { useAppStore, useMonthData, useProfile, type CategoryId } from "@/lib/store";
import type { RecurringFreq } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function IncomeCard() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const data = useMonthData();
  const setIncome = useAppStore((s) => s.setIncome);
  const copyPreviousMonth = useAppStore((s) => s.copyPreviousMonth);
  const sym = currencySymbol(currency);
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? String(data.income || "");

  function commit() {
    const raw = draft ?? shown;
    const parsed = evalAmountExpr(raw);
    if (parsed !== null) setIncome(parsed);
    setDraft(null);
  }

  return (
    <Panel accent="income">
      <h2 className="mb-3 flex items-center gap-2 text-base font-semibold">
        <Wallet className="size-5 text-primary" />
        {t(lang, "budget.incomeTitle", { month: monthTitle(month, lang) })}
      </h2>
      <div className="flex overflow-hidden rounded-md bg-elevated card-shadow">
        <span className="flex items-center px-3 text-muted">{sym}</span>
        <input
          inputMode="text"
          className="h-12 min-w-0 flex-1 bg-transparent px-2 text-lg tabular outline-none"
          value={shown}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          aria-label={t(lang, "budget.incomeTitle", { month: monthTitle(month, lang) })}
        />
      </div>
      <p className="mt-1 text-xs text-subtle">{t(lang, "budget.incomeExprHint")}</p>
      <Button variant="ghost" size="sm" className="mt-2 px-0 text-muted" onClick={() => copyPreviousMonth()}>
        {t(lang, "budget.copyMonth")}
      </Button>
    </Panel>
  );
}

export function LeftoverCard() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const snap = monthSnapshot(profile, month);
  const tone = snap.leftToBudget < -1 ? "danger" : snap.leftToBudget > 1 ? "warning" : "success";
  return (
    <Panel>
      <p className="text-sm text-muted">{t(lang, "budget.leftoverTitle")}</p>
      <p
        className={cn(
          "mt-1 text-3xl font-semibold tabular tracking-tight",
          tone === "danger" && "text-danger",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {formatMoney(snap.leftToBudget, currency, lang)}
      </p>
      <p className="mt-2 text-sm text-muted">
        {snap.leftToBudget < -1
          ? t(lang, "budget.leftoverNeg")
          : snap.leftToBudget > 1
            ? t(lang, "budget.leftoverPos")
            : t(lang, "budget.leftoverOk")}
      </p>
      {snap.percentSum > 100.05 ? (
        <p className="mt-3 rounded-md bg-warning/10 px-3 py-2 text-xs text-warning">
          {t(lang, "budget.percentWarn", { sum: snap.percentSum.toFixed(1) })}
        </p>
      ) : null}
    </Panel>
  );
}

export function CategoryCard({
  id,
  icon,
  title,
  hint,
}: {
  id: CategoryId;
  icon: ReactNode;
  title: string;
  hint: string;
}) {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const advanced = useAppStore((s) => s.advancedView);
  const profile = useProfile();
  const snap = monthSnapshot(profile, month);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSource, setEditSource] = useState<"manual" | "recurring" | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [freq, setFreq] = useState<RecurringFreq>("monthly");
  const [methodId, setMethodId] = useState("");
  const [inflowOpen, setInflowOpen] = useState(false);
  const [inflowId, setInflowId] = useState<string | null>(null);
  const [inflowName, setInflowName] = useState("");
  const [inflowAmount, setInflowAmount] = useState(0);
  const [inflowRepeat, setInflowRepeat] = useState(true);
  const [inflowFreq, setInflowFreq] = useState<RecurringFreq>("monthly");
  const items = displayItemsFor(profile, month, id);
  const actual = snap[id];
  const extras = extrasFor(profile, month, id);
  const target = snap.targets[id];
  const pct = profile.percents[id];
  const remaining = target - actual;
  const usedPct = target > 0 ? (actual / target) * 100 : 0;
  const inflows = (profile.inflows ?? []).filter(
    (inf) => (inf.category ?? "investing") === id && isInflowDue(inf, month),
  );

  function openAdd() {
    setEditingId(null);
    setEditSource(null);
    setName("");
    setAmount(0);
    setFreq("monthly");
    setMethodId("");
    setOpen(true);
  }

  function openEdit(it: (typeof items)[number]) {
    if (!it.editable) return;
    if (it.source === "recurring" && it.sourceId) {
      const rec = profile.recurring.find((r) => r.id === it.sourceId);
      setEditingId(it.sourceId);
      setEditSource("recurring");
      setFreq(rec?.frequency ?? "monthly");
    } else {
      setEditingId(it.id);
      setEditSource("manual");
      setFreq("monthly");
    }
    setName(it.name);
    setAmount(it.amount);
    const rec = it.source === "recurring" && it.sourceId ? profile.recurring.find((r) => r.id === it.sourceId) : undefined;
    setMethodId(it.methodId ?? rec?.methodId ?? "");
    setOpen(true);
  }

  function saveItem() {
    if (!name.trim()) return;
    if (editingId && editSource === "recurring") {
      useAppStore.getState().updateRecurring(editingId, {
        name: name.trim(),
        amount,
        frequency: freq,
        methodId: methodId || undefined,
      });
    } else if (editingId) {
      useAppStore.getState().updateItem(editingId, { name: name.trim(), amount, methodId: methodId || undefined });
    } else {
      useAppStore.getState().addItem({ name: name.trim(), amount, category: id, methodId: methodId || undefined });
    }
    setName("");
    setAmount(0);
    setEditingId(null);
    setEditSource(null);
    setOpen(false);
  }

  function openAddInflow() {
    setInflowId(null);
    setInflowName("");
    setInflowAmount(0);
    setInflowRepeat(true);
    setInflowFreq("monthly");
    setInflowOpen(true);
  }

  function openEditInflow(idToEdit: string) {
    const inf = profile.inflows.find((x) => x.id === idToEdit);
    if (!inf) return;
    setInflowId(inf.id);
    setInflowName(inf.name);
    setInflowAmount(inf.amount);
    setInflowRepeat(inf.recurring);
    setInflowFreq(inf.frequency ?? "monthly");
    setInflowOpen(true);
  }

  function saveInflow() {
    if (!inflowName.trim() || inflowAmount <= 0) return;
    if (inflowId) {
      useAppStore.getState().updateInflow(inflowId, {
        name: inflowName.trim(),
        amount: inflowAmount,
        recurring: inflowRepeat,
        frequency: inflowFreq,
      });
    } else {
      useAppStore.getState().addInflow({
        name: inflowName.trim(),
        amount: inflowAmount,
        category: id,
        recurring: inflowRepeat,
        frequency: inflowFreq,
        startMonth: month,
        active: true,
      });
    }
    setInflowOpen(false);
    setInflowId(null);
  }

  return (
    <Panel fold={`cat-${id}`} foldTitle={title} accent={id === "investing" ? "invest" : id === "flexible" ? "fun" : "essential"}>
      <div className="fold-head mb-1 flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-muted">{icon}</span>
      </div>
      <p className="text-sm text-muted">{hint}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>
          {t(lang, "budget.target")}: {formatMoney(target, currency, lang)}
        </span>
        <label className="flex items-center gap-1 text-muted">
          <Input
            className="h-11 w-20 px-2"
            type="number"
            step="0.1"
            inputMode="decimal"
            value={pct}
            onChange={(e) => useAppStore.getState().setPercent(id, Number(e.target.value) || 0)}
            aria-label={t(lang, "budget.target")}
          />
          %
        </label>
      </div>
      {extras > 0 && advanced ? (
        <p className="mt-1 text-xs text-success">
          {t(lang, "budget.extrasIncludes", { amount: formatMoney(extras, currency, lang) })}
        </p>
      ) : null}
      <Progress value={usedPct} className="my-2" barClassName={usedPct > 100 ? "bg-danger" : undefined} />
      <div className="flex justify-between text-sm">
        <span>
          {t(lang, "budget.actual")}: {formatMoney(actual, currency, lang)}
        </span>
        <span className="text-muted">({usedPct.toFixed(1)}%)</span>
      </div>
      <div className="mt-1 flex justify-between text-sm">
        <span>{t(lang, "budget.remaining")}:</span>
        <span className={cn("tabular", remaining < 0 ? "text-danger" : "text-success")}>
          {formatMoney(remaining, currency, lang)}
        </span>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">
          {title} {t(lang, "budget.items")}
        </p>
        <label className="flex items-center justify-between gap-2 text-xs text-muted sm:justify-end">
          {t(lang, "budget.adjustment")}
          <Input
            className="h-11 w-28"
            type="number"
            inputMode="decimal"
            value={profile.adjustments[id]}
            onChange={(e) => useAppStore.getState().setAdjustment(id, Number(e.target.value) || 0)}
          />
        </label>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-subtle">{t(lang, "budget.noItems")}</p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {items.map((it) => (
            <li key={it.id} className="flex items-center gap-1 rounded-md bg-elevated pl-3 pr-1 text-sm">
              <button
                type="button"
                className="min-h-11 min-w-0 flex-1 py-2 text-left disabled:opacity-100"
                onClick={() => openEdit(it)}
                disabled={!it.editable}
              >
                <span className="block truncate">{it.name}</span>
                {it.source !== "manual" || it.methodId ? (
                <span className="block text-[0.65rem] uppercase tracking-wide text-muted">
                  {it.source !== "manual"
                    ? it.source === "recurring"
                      ? t(lang, "budget.badgeRecurring")
                      : it.source === "debt"
                        ? t(lang, "budget.badgeDebt")
                        : t(lang, "budget.badgeInstallment")
                    : null}
                  {it.methodId
                    ? `${it.source !== "manual" ? " · " : ""}${profile.paymentMethods.find((m) => m.id === it.methodId)?.name ?? ""}`
                    : ""}
                </span>
                ) : null}
              </button>
              <span className="tabular">{formatMoney(it.amount, currency, lang)}</span>
              {it.editable ? (
                <button
                  type="button"
                  onClick={() => openEdit(it)}
                  className="flex size-11 shrink-0 items-center justify-center text-muted hover:text-fg"
                  aria-label={t(lang, "common.edit")}
                >
                  <Pencil className="size-4" />
                </button>
              ) : (
                <span className="size-11 shrink-0" />
              )}
              <button
                type="button"
                onClick={() => {
                  if (it.source === "recurring" && it.sourceId) useAppStore.getState().skipRecurring(it.sourceId);
                  else if (it.source === "large" && it.sourceId) useAppStore.getState().skipLarge(it.sourceId);
                  else if (it.source === "debt" && it.sourceId) useAppStore.getState().skipDebt(it.sourceId);
                  else useAppStore.getState().removeItem(it.id);
                }}
                className="flex size-11 shrink-0 items-center justify-center text-muted hover:text-danger"
                aria-label={t(lang, "common.delete")}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Button variant="secondary" className="mt-3 w-full" onClick={openAdd}>
        <Plus className="size-4" /> {t(lang, "budget.addItem")}
      </Button>

      {id === "investing" && advanced ? (
        <div className="mt-5 border-t border-border pt-4">
          <h3 className="text-sm font-medium">{t(lang, "budget.extras")}</h3>
          <p className="mt-1 text-xs text-muted">{t(lang, "budget.extrasHint")}</p>
          {inflows.length === 0 ? (
            <p className="py-4 text-center text-sm text-subtle">{t(lang, "budget.noInflows")}</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {inflows.map((inf) => (
                <li key={inf.id} className="flex items-center gap-1 rounded-md bg-elevated pl-3 pr-1 text-sm">
                  <button
                    type="button"
                    className="min-h-11 min-w-0 flex-1 py-2 text-left"
                    onClick={() => openEditInflow(inf.id)}
                  >
                    <span className="block truncate">{inf.name}</span>
                    <span className="text-[0.65rem] uppercase tracking-wide text-muted">
                      {inf.recurring ? t(lang, FREQ_LABEL[inf.frequency ?? "monthly"]) : t(lang, "budget.oneTime")}
                    </span>
                  </button>
                  <span className="tabular text-success">+{formatMoney(inf.amount, currency, lang)}</span>
                  <button
                    type="button"
                    onClick={() => openEditInflow(inf.id)}
                    className="flex size-11 shrink-0 items-center justify-center text-muted hover:text-fg"
                    aria-label={t(lang, "common.edit")}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => useAppStore.getState().removeInflow(inf.id)}
                    className="flex size-11 shrink-0 items-center justify-center text-muted hover:text-danger"
                    aria-label={t(lang, "common.delete")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Button variant="secondary" className="mt-3 w-full" onClick={openAddInflow}>
            <Plus className="size-4" /> {t(lang, "budget.addInflow")}
          </Button>
        </div>
      ) : null}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setEditingId(null);
            setEditSource(null);
          }
        }}
      >
        <DialogContent
          title={
            editSource === "recurring"
              ? t(lang, "budget.editRecurring")
              : editingId
                ? t(lang, "budget.editItem")
                : t(lang, "budget.addItem")
          }
        >
          <div className="space-y-3">
            <div>
              <Label>{t(lang, "budget.name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>{t(lang, "budget.total")}</Label>
              <AmountExprInput key={editingId ?? "new-item"} value={amount} onValue={setAmount} />
              <p className="mt-1 text-xs text-subtle">{t(lang, "budget.amountExprHint")}</p>
            </div>
            {editSource === "recurring" ? (
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
            ) : null}
            <MethodSelect value={methodId} onChange={setMethodId} />
            <Button className="w-full" onClick={saveItem}>
              {t(lang, "budget.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={inflowOpen} onOpenChange={setInflowOpen}>
        <DialogContent title={inflowId ? t(lang, "budget.editInflow") : t(lang, "budget.addInflow")}>
          <div className="space-y-3">
            <p className="text-xs text-muted">{t(lang, "budget.extrasHint")}</p>
            <div>
              <Label>{t(lang, "budget.name")}</Label>
              <Input
                value={inflowName}
                onChange={(e) => setInflowName(e.target.value)}
                placeholder="eToro Popular Investor"
              />
            </div>
            <div>
              <Label>{t(lang, "budget.total")}</Label>
              <AmountExprInput key={inflowId ?? "new-inflow"} value={inflowAmount} onValue={setInflowAmount} />
              <p className="mt-1 text-xs text-subtle">{t(lang, "budget.amountExprHint")}</p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={inflowRepeat}
                onChange={(e) => setInflowRepeat(e.target.checked)}
                className="size-4"
              />
              {t(lang, "budget.inflowRepeat")}
            </label>
            {inflowRepeat ? (
              <div>
                <Label>{t(lang, "budget.frequency")}</Label>
                <NativeSelect value={inflowFreq} onChange={(e) => setInflowFreq(e.target.value as RecurringFreq)}>
                  {RECURRING_FREQS.map((f) => (
                    <option key={f} value={f}>
                      {t(lang, FREQ_LABEL[f])}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            ) : null}
            <Button className="w-full" onClick={saveInflow}>
              {t(lang, "budget.save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Panel>
  );
}

export function GoalsCard() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const data = useMonthData();
  const snap = monthSnapshot(profile, month);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [goalTarget, setGoalTarget] = useState(0);
  const [goalCurrent, setGoalCurrent] = useState(0);
  const contrib = snap.savings;
  const target = snap.targets.savings;
  const used = target > 0 ? (contrib / target) * 100 : 0;

  function openAdd() {
    setEditingId(null);
    setName("");
    setGoalTarget(0);
    setGoalCurrent(0);
    setOpen(true);
  }

  function openEdit(id: string) {
    const g = profile.goals.find((x) => x.id === id);
    if (!g) return;
    setEditingId(id);
    setName(g.name);
    setGoalTarget(g.target);
    setGoalCurrent(g.current);
    setOpen(true);
  }
  return (
    <Panel fold="goals" foldTitle={t(lang, "budget.goals")} accent="goals">
      <div className="mb-1 flex items-start justify-end">
        <h2 className="fold-title mr-auto flex items-center gap-2 text-lg font-semibold">
          <PiggyBank className="size-5 text-primary" />
          {t(lang, "budget.goals")}
        </h2>
        <label className="flex items-center gap-1 text-sm text-muted">
          <Input
            className="h-11 w-20 px-2"
            type="number"
            step="0.1"
            value={profile.percents.savings}
            onChange={(e) => useAppStore.getState().setPercent("savings", Number(e.target.value) || 0)}
          />
          %
        </label>
      </div>
      <p className="mt-1 text-sm text-muted">{t(lang, "budget.goalsHint")}</p>
      <div className="mt-4 flex justify-between text-sm">
        <span>{t(lang, "budget.totalMonthly")}</span>
        <span className="tabular">
          {formatMoney(contrib, currency, lang)} / {formatMoney(target, currency, lang)}
        </span>
      </div>
      <Progress value={used} className="my-2" />
      <div className="mb-3 flex items-center justify-between text-xs text-muted">
        <span>
          {t(lang, "budget.remaining")} ({used.toFixed(1)}%)
        </span>
        <label className="flex items-center gap-2">
          {t(lang, "budget.adjustment")}
          <Input
            className="h-11 w-24"
            type="number"
            value={profile.adjustments.savings}
            onChange={(e) => useAppStore.getState().setAdjustment("savings", Number(e.target.value) || 0)}
          />
        </label>
      </div>
      <div className="space-y-3">
        {profile.goals.map((g) => {
          const monthAmt = data.goalContributions[g.id] ?? 0;
          const shown = g.current + monthAmt;
          const gPct = g.target > 0 ? (shown / g.target) * 100 : 0;
          return (
            <div key={g.id} className="rounded-lg bg-elevated p-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{g.name}</p>
                  <p className="text-xs text-muted tabular">
                    {formatMoney(shown, currency, lang)} / {formatMoney(g.target, currency, lang)}
                  </p>
                </div>
                <span className="flex items-center">
                  <button
                    onClick={() => openEdit(g.id)}
                    className="flex size-11 items-center justify-center text-muted hover:text-fg"
                    aria-label={t(lang, "common.edit")}
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => useAppStore.getState().removeGoal(g.id)}
                    className="flex size-11 items-center justify-center text-muted hover:text-danger"
                    aria-label={t(lang, "common.delete")}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </span>
              </div>
              <Progress value={gPct} className="my-2" />
              <Label className="text-xs">{t(lang, "budget.thisMonth")}</Label>
              <div className="flex overflow-hidden rounded-md bg-card card-shadow">
                <span className="flex items-center px-2 text-muted">{currencySymbol(currency)}</span>
                <AmountExprInput
                  className="h-10 min-w-0 flex-1 rounded-none bg-transparent px-2 text-sm"
                  value={monthAmt}
                  onValue={(n) => useAppStore.getState().setGoalContribution(g.id, n)}
                  placeholder={t(lang, "budget.amount")}
                />
              </div>
              <div className="mt-2">
                <MethodSelect
                  value={
                    profile.transactions.find((t) => t.goalId === g.id && t.date.startsWith(month))?.methodId ?? ""
                  }
                  onChange={(mid) => useAppStore.getState().setGoalContribution(g.id, monthAmt, mid)}
                />
              </div>
            </div>
          );
        })}
        {profile.largePurchases
          .filter((lp) => lp.category === "savings" && isLargeActive(lp, month))
          .map((lp) => {
            const prog = largeProgress(lp, month);
            return (
              <div key={lp.id} className="rounded-lg bg-elevated p-3">
                <p className="font-medium">{lp.name}</p>
                <p className="text-xs text-muted">
                  {t(lang, "budget.badgeInstallment")} · {t(lang, "budget.monthOf", { n: prog.index + 1, total: lp.months })}
                </p>
                <p className="mt-1 text-sm tabular">{formatMoney(installmentOf(lp), currency, lang)}</p>
              </div>
            );
          })}
        {profile.debts
          .filter((d) => (d.category ?? "essential") === "savings" && isDebtActive(d, month))
          .map((d) => (
            <div key={d.id} className="rounded-lg bg-elevated p-3">
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-muted">{t(lang, "budget.badgeDebt")}</p>
              <p className="mt-1 text-sm tabular">{formatMoney(d.minPayment, currency, lang)}</p>
            </div>
          ))}
      </div>
      <Button variant="secondary" className="mt-3 w-full" onClick={openAdd}>
        <Plus className="size-4" /> {t(lang, "budget.addGoal")}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setEditingId(null);
        }}
      >
        <DialogContent title={editingId ? t(lang, "budget.editGoal") : t(lang, "budget.addGoal")}>
          <div className="space-y-3">
            <div>
              <Label>{t(lang, "budget.name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>{t(lang, "budget.targetAmount")}</Label>
              <AmountExprInput key={`${editingId ?? "new"}-target`} value={goalTarget} onValue={setGoalTarget} />
            </div>
            <div>
              <Label>{t(lang, "budget.alreadySaved")}</Label>
              <AmountExprInput key={`${editingId ?? "new"}-current`} value={goalCurrent} onValue={setGoalCurrent} />
            </div>
            <Button
              className="w-full"
              onClick={() => {
                if (!name.trim()) return;
                if (editingId) {
                  useAppStore.getState().updateGoal(editingId, {
                    name: name.trim(),
                    target: goalTarget,
                    current: goalCurrent,
                  });
                } else {
                  useAppStore.getState().addGoal({ name: name.trim(), target: goalTarget, current: goalCurrent });
                }
                setName("");
                setGoalTarget(0);
                setGoalCurrent(0);
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

export function DebtAllocCard() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const snap = monthSnapshot(profile, month);
  const actual = snap.debt;
  const target = snap.targets.debt;
  const remaining = target - actual;
  const usedPct = target > 0 ? (actual / target) * 100 : 0;
  return (
    <Panel fold="debt-alloc" foldTitle={t(lang, "budget.debtAlloc")} accent="debt">
      <div className="fold-head mb-1 flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold">{t(lang, "budget.debtAlloc")}</h2>
        <TrendingDown className="size-5 text-muted" />
      </div>
      <p className="text-sm text-muted">{t(lang, "budget.debtAllocHint")}</p>
      <div className="mt-4 flex items-end justify-between text-sm">
        <span>
          {t(lang, "budget.target")}: {formatMoney(target, currency, lang)}
        </span>
        <label className="flex items-center gap-1 text-muted">
          <Input
            className="h-11 w-20 px-2"
            type="number"
            step="0.1"
            value={profile.percents.debt}
            onChange={(e) => useAppStore.getState().setPercent("debt", Number(e.target.value) || 0)}
          />
          %
        </label>
      </div>
      <Progress value={usedPct} className="my-2" />
      <div className="flex justify-between text-sm">
        <span>
          {t(lang, "budget.actual")}: {formatMoney(actual, currency, lang)}
        </span>
        <span className={cn("tabular", remaining < 0 ? "text-danger" : "text-success")}>
          {formatMoney(remaining, currency, lang)}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {profile.largePurchases
          .filter((lp) => lp.category === "debt" && isLargeActive(lp, month))
          .map((lp) => {
            const prog = largeProgress(lp, month);
            return (
              <div key={lp.id} className="rounded-lg bg-elevated p-3">
                <p className="font-medium">{lp.name}</p>
                <p className="text-xs text-muted">
                  {t(lang, "budget.badgeInstallment")} · {t(lang, "budget.monthOf", { n: prog.index + 1, total: lp.months })}
                </p>
                <p className="mt-1 text-sm tabular">{formatMoney(installmentOf(lp), currency, lang)}</p>
              </div>
            );
          })}
        {profile.debts
          .filter((d) => d.category === "debt" && isDebtActive(d, month))
          .map((d) => (
            <div key={d.id} className="rounded-lg bg-elevated p-3">
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-muted">{t(lang, "budget.badgeDebt")}</p>
              <p className="mt-1 text-sm tabular">{formatMoney(d.minPayment, currency, lang)}</p>
            </div>
          ))}
      </div>
    </Panel>
  );
}

export function MonthlySummary() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const snap = monthSnapshot(profile, month);
  const pie = [
    { name: t(lang, "budget.essential"), value: snap.essential, color: "#6E7BFF" },
    { name: t(lang, "budget.investing"), value: snap.investing, color: "#13C636" },
    { name: t(lang, "budget.flexible"), value: snap.flexible, color: "#F5A623" },
    { name: t(lang, "budget.goals"), value: snap.savings, color: "#5EEAD4" },
    { name: t(lang, "budget.debtAlloc"), value: snap.debt, color: "#FF6B7A" },
  ].filter((d) => d.value > 0);
  return (
    <Panel fold="summary" foldTitle={t(lang, "budget.monthlySummary")} accent="review">
      <h2 className="fold-title text-lg font-semibold">{t(lang, "budget.monthlySummary")}</h2>
      <p className="text-sm text-muted">{t(lang, "budget.monthlyHint")}</p>
      {pie.length === 0 ? (
        <p className="py-10 text-center text-sm text-subtle">{t(lang, "budget.enterSpending")}</p>
      ) : (
        <div className="mx-auto h-48 w-full max-w-xs">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pie}
                dataKey="value"
                nameKey="name"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
                label={false}
                labelLine={false}
                isAnimationActive={false}
              >
                {pie.map((p) => (
                  <Cell key={p.name} fill={p.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => formatMoney(Number(v), currency, lang)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      {pie.length > 0 ? (
        <ul className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-muted">
          {pie.map((p) => (
            <li key={p.name} className="flex items-center gap-1.5">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
              {p.name}
            </li>
          ))}
        </ul>
      ) : null}
      <Row label={t(lang, "budget.totalIncome")} value={formatMoney(snap.income, currency, lang)} />
      {snap.extras > 0 ? (
        <Row label={t(lang, "budget.extrasLine")} value={formatMoney(snap.extras, currency, lang)} tone="success" />
      ) : null}
      <Row label={t(lang, "budget.totalExpenses")} value={formatMoney(snap.expenses, currency, lang)} tone="danger" />
      <Row label={t(lang, "budget.totalSavedInv")} value={formatMoney(snap.savedInv, currency, lang)} tone="success" />
      <Row label={t(lang, "budget.finalBalance")} value={formatMoney(snap.leftover, currency, lang)} />
    </Panel>
  );
}

export function CategoryIcons() {
  return {
    essential: <Home className="size-5" />,
    investing: <Landmark className="size-5" />,
    flexible: <ShoppingBag className="size-5" />,
  };
}

export function AllocMini({ k, label }: { k: AllocKey; label: string }) {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const snap = monthSnapshot(profile, month);
  const actual = snap[k];
  const target = snap.targets[k];
  const used = target > 0 ? (actual / target) * 100 : 0;
  return (
    <div className="rounded-xl bg-card p-4 card-shadow">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold tabular">{formatMoney(actual, currency, lang)}</p>
      <Progress value={used} className="mt-2" />
      <p className="mt-1 text-xs text-subtle">
        {t(lang, "budget.target")} {formatMoney(target, currency, lang)}
      </p>
    </div>
  );
}

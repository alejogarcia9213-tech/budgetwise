import type {
  AllocKey,
  BudgetItem,
  CategoryId,
  ExtraInflow,
  LargePurchase,
  MonthData,
  Profile,
  RecurringExpense,
  RecurringFreq,
  Transaction,
} from "./types";
import { monthsBetween, yearOf } from "./dates";
import { roundMoney } from "./money";

export type { AllocKey };
export const ALLOC_KEYS: AllocKey[] = ["essential", "flexible", "investing", "savings", "debt"];

export const RECURRING_FREQS: RecurringFreq[] = [
  "monthly",
  "bimonthly",
  "quarterly",
  "semiannual",
  "yearly",
];

export const FREQ_LABEL: Record<RecurringFreq, string> = {
  monthly: "budget.freqMonthly",
  bimonthly: "budget.freqBimonthly",
  quarterly: "budget.freqQuarterly",
  semiannual: "budget.freqSemiannual",
  yearly: "budget.freqYearly",
};


export const FREQ_STEPS: Record<RecurringFreq, number> = {
  monthly: 1,
  bimonthly: 2,
  quarterly: 3,
  semiannual: 6,
  yearly: 12,
};

export function emptyMonth(): MonthData {
  return { income: 0, items: [], goalContributions: {} };
}

export function monthOf(profile: Profile, monthKey: string): MonthData {
  return profile.months[monthKey] ?? emptyMonth();
}

export function txsInMonth(profile: Profile, monthKey: string): Transaction[] {
  return (profile.transactions ?? []).filter((t) => t.date.startsWith(monthKey));
}

export function sumItems(data: MonthData, cat: CategoryId) {
  return data.items.filter((i) => i.category === cat).reduce((s, i) => s + i.amount, 0);
}

export function installmentOf(lp: LargePurchase) {
  return lp.months > 0 ? lp.total / lp.months : 0;
}

export function largeMonthIndex(lp: LargePurchase, monthKey: string) {
  return monthsBetween(lp.startMonth, monthKey);
}

export function isLargeActive(lp: LargePurchase, monthKey: string) {
  const idx = largeMonthIndex(lp, monthKey);
  if (idx < 0 || idx >= lp.months) return false;
  if (lp.skippedMonths?.includes(monthKey)) return false;
  return true;
}

export function isLargeCompleted(lp: LargePurchase, monthKey: string) {
  return largeMonthIndex(lp, monthKey) >= lp.months;
}

export function largeProgress(lp: LargePurchase, monthKey: string) {
  const idx = largeMonthIndex(lp, monthKey);
  const dueCount = idx < 0 ? 0 : Math.min(lp.months, idx + 1);
  const installment = installmentOf(lp);
  return {
    index: idx,
    dueCount,
    installment,
    remaining: Math.max(0, lp.total - installment * dueCount),
    active: isLargeActive(lp, monthKey),
    completed: isLargeCompleted(lp, monthKey),
  };
}

export function largePurchaseForMonth(p: Profile, monthKey: string, cat?: AllocKey): number {
  return p.largePurchases.reduce((sum, lp) => {
    if (!isLargeActive(lp, monthKey)) return sum;
    if (cat && (lp.category ?? "essential") !== cat) return sum;
    return sum + installmentOf(lp);
  }, 0);
}

export function isScheduleDue(
  startMonth: string | undefined,
  frequency: RecurringFreq | undefined,
  monthKey: string,
  skipped?: string[],
  active?: boolean,
) {
  if (active === false) return false;
  if (skipped?.includes(monthKey)) return false;
  const start = startMonth || monthKey;
  const delta = monthsBetween(start, monthKey);
  if (delta < 0) return false;
  const step = FREQ_STEPS[frequency ?? "monthly"] ?? 1;
  return delta % step === 0;
}

export function isRecurringDue(r: RecurringExpense, monthKey: string) {
  return isScheduleDue(r.startMonth, r.frequency ?? "monthly", monthKey, r.skippedMonths, r.active);
}

export function isDebtActive(d: { balance: number; skippedMonths?: string[] }, monthKey: string) {
  if (d.balance <= 0.005) return false;
  if (d.skippedMonths?.includes(monthKey)) return false;
  return true;
}

export function isSpendCat(cat: AllocKey | undefined): cat is CategoryId {
  return cat === "essential" || cat === "flexible" || cat === "investing";
}

export function allocI18nKey(cat: AllocKey | undefined): string {
  if (cat === "savings") return "budget.goals";
  if (cat === "debt") return "budget.debtAlloc";
  return `budget.${cat ?? "essential"}`;
}

export function isInflowDue(inf: ExtraInflow, monthKey: string) {
  if (inf.active === false) return false;
  if (inf.skippedMonths?.includes(monthKey)) return false;
  if (!inf.recurring) return inf.startMonth === monthKey;
  return isScheduleDue(inf.startMonth, inf.frequency ?? "monthly", monthKey, inf.skippedMonths, inf.active);
}

export function targetOf(profile: Profile, income: number, key: AllocKey) {
  const pct = profile.percents[key] ?? 0;
  const adj = profile.adjustments[key] ?? 0;
  return roundMoney(income * (pct / 100) + adj);
}

export interface DisplayItem {
  id: string;
  name: string;
  amount: number;
  source: "manual" | "recurring" | "large" | "debt";
  sourceId?: string;
  editable: boolean;
  methodId?: string;
}

export function findMergeableItem(
  items: BudgetItem[],
  next: Pick<BudgetItem, "name" | "category"> & { source?: BudgetItem["source"] },
): BudgetItem | undefined {
  if (next.source && next.source !== "manual") return undefined;
  const key = next.name.trim().toLowerCase();
  if (!key) return undefined;
  return items.find(
    (it) =>
      (it.source ?? "manual") === "manual" &&
      it.category === next.category &&
      it.name.trim().toLowerCase() === key,
  );
}

export function findMergeableTx(
  txs: Transaction[],
  next: Pick<Transaction, "name" | "category" | "type" | "date"> &
    Partial<Pick<Transaction, "recurringExpenseId" | "debtId" | "largePurchaseId" | "inflowId">>,
): Transaction | undefined {
  if (next.recurringExpenseId || next.debtId || next.largePurchaseId || next.inflowId) return undefined;
  const month = next.date.slice(0, 7);
  const key = next.name.trim().toLowerCase();
  if (!key) return undefined;
  return txs.find(
    (t) =>
      t.date.slice(0, 7) === month &&
      t.name.trim().toLowerCase() === key &&
      t.category === next.category &&
      t.type === next.type &&
      !t.recurringExpenseId &&
      !t.debtId &&
      !t.largePurchaseId &&
      !t.inflowId,
  );
}

export function displayItemsFor(profile: Profile, monthKey: string, cat: CategoryId): DisplayItem[] {
  const data = monthOf(profile, monthKey);
  const out: DisplayItem[] = [];
  const seenRec = new Set<string>();
  const seenLarge = new Set<string>();
  const seenDebt = new Set<string>();

  for (const it of data.items) {
    if (it.category !== cat) continue;
    const source = it.source ?? "manual";
    out.push({
      id: it.id,
      name: it.name,
      amount: it.amount,
      source,
      sourceId: it.sourceId,
      editable: source === "manual" || source === "recurring",
      methodId: it.methodId,
    });
    if (source === "recurring" && it.sourceId) seenRec.add(it.sourceId);
    if (source === "large" && it.sourceId) seenLarge.add(it.sourceId);
    if (source === "debt" && it.sourceId) seenDebt.add(it.sourceId);
  }

  for (const r of profile.recurring ?? []) {
    if (r.category !== cat) continue;
    if (!isRecurringDue(r, monthKey)) continue;
    if (seenRec.has(r.id)) continue;
    if (out.some((i) => i.name.toLowerCase() === r.name.toLowerCase() && i.source === "manual")) continue;
    out.push({
      id: `rec-${r.id}`,
      name: r.name,
      amount: r.amount,
      source: "recurring",
      sourceId: r.id,
      editable: true,
      methodId: r.methodId,
    });
  }

  for (const lp of profile.largePurchases ?? []) {
    if ((lp.category ?? "essential") !== cat) continue;
    if (!isLargeActive(lp, monthKey)) continue;
    if (seenLarge.has(lp.id)) continue;
    out.push({
      id: `lp-${lp.id}`,
      name: lp.name,
      amount: installmentOf(lp),
      source: "large",
      sourceId: lp.id,
      editable: false,
      methodId: lp.methodId,
    });
  }

  for (const d of profile.debts ?? []) {
    if ((d.category ?? "essential") !== cat) continue;
    if (!isDebtActive(d, monthKey)) continue;
    if (seenDebt.has(d.id)) continue;
    out.push({
      id: `debt-${d.id}`,
      name: d.name,
      amount: d.minPayment,
      source: "debt",
      sourceId: d.id,
      editable: false,
      methodId: d.methodId,
    });
  }

  return out;
}

export function categoryActual(profile: Profile, monthKey: string, cat: AllocKey): number {
  const data = monthOf(profile, monthKey);
  const txs = txsInMonth(profile, monthKey).filter((t) => t.category === cat && t.type !== "income");
  const coveredItems = new Set(txs.map((t) => t.itemId).filter(Boolean) as string[]);
  const coveredLarge = new Set(txs.map((t) => t.largePurchaseId).filter(Boolean) as string[]);
  const coveredRec = new Set(txs.map((t) => t.recurringExpenseId).filter(Boolean) as string[]);
  const coveredGoals = new Set(txs.map((t) => t.goalId).filter(Boolean) as string[]);
  const coveredDebt = new Set(txs.map((t) => t.debtId).filter(Boolean) as string[]);

  let sum = txs.reduce((s, t) => s + t.amount, 0);

  if (cat === "essential" || cat === "flexible" || cat === "investing") {
    for (const it of data.items) {
      if (it.category !== cat) continue;
      if (coveredItems.has(it.id)) continue;
      sum += it.amount;
    }
    for (const r of profile.recurring ?? []) {
      if (r.category !== cat) continue;
      if (!isRecurringDue(r, monthKey)) continue;
      if (coveredRec.has(r.id)) continue;
      if (data.items.some((i) => i.sourceId === r.id || i.name.toLowerCase() === r.name.toLowerCase())) continue;
      if (txs.some((t) => t.name.toLowerCase() === r.name.toLowerCase())) continue;
      sum += r.amount;
    }
  }

  for (const lp of profile.largePurchases ?? []) {
    if ((lp.category ?? "essential") !== cat) continue;
    if (!isLargeActive(lp, monthKey)) continue;
    if (coveredLarge.has(lp.id)) continue;
    if (data.items.some((i) => i.sourceId === lp.id)) continue;
    sum += installmentOf(lp);
  }

  for (const d of profile.debts ?? []) {
    if ((d.category ?? "essential") !== cat) continue;
    if (!isDebtActive(d, monthKey)) continue;
    if (coveredDebt.has(d.id)) continue;
    if (data.items.some((i) => i.sourceId === d.id)) continue;
    sum += d.minPayment;
  }

  if (cat === "savings") {
    for (const [gid, amt] of Object.entries(data.goalContributions)) {
      if (coveredGoals.has(gid)) continue;
      sum += amt;
    }
  }

  return roundMoney(sum);
}

export function extrasFor(profile: Profile, monthKey: string, cat: AllocKey): number {
  const txs = txsInMonth(profile, monthKey).filter((t) => t.category === cat && t.type === "income");
  const covered = new Set(txs.map((t) => t.inflowId).filter(Boolean) as string[]);
  let sum = txs.reduce((s, t) => s + t.amount, 0);
  for (const inf of profile.inflows ?? []) {
    if ((inf.category ?? "investing") !== cat) continue;
    if (!isInflowDue(inf, monthKey)) continue;
    if (covered.has(inf.id)) continue;
    sum += inf.amount;
  }
  return roundMoney(sum);
}

export interface MonthSnapshot {
  income: number;
  essential: number;
  flexible: number;
  investing: number;
  savings: number;
  debt: number;
  extras: number;
  expenses: number;
  savedInv: number;
  leftover: number;
  targets: Record<AllocKey, number>;
  allocated: number;
  leftToBudget: number;
  percentSum: number;
}

export function monthSnapshot(profile: Profile, monthKey: string): MonthSnapshot {
  const data = monthOf(profile, monthKey);
  const essential = categoryActual(profile, monthKey, "essential");
  const flexible = categoryActual(profile, monthKey, "flexible");
  const investing = categoryActual(profile, monthKey, "investing");
  const savings = categoryActual(profile, monthKey, "savings");
  const debt = categoryActual(profile, monthKey, "debt");
  const extrasByCat = Object.fromEntries(ALLOC_KEYS.map((k) => [k, extrasFor(profile, monthKey, k)])) as Record<
    AllocKey,
    number
  >;
  const extras = extrasByCat.investing;
  const expenses = essential + flexible;
  const savedInv = savings + investing;
  const leftover = roundMoney(data.income + extrasByCat.essential + extrasByCat.flexible + extrasByCat.investing + extrasByCat.savings + extrasByCat.debt - expenses - savedInv - debt);
  const baseTargets = {
    essential: targetOf(profile, data.income, "essential"),
    flexible: targetOf(profile, data.income, "flexible"),
    investing: targetOf(profile, data.income, "investing"),
    savings: targetOf(profile, data.income, "savings"),
    debt: targetOf(profile, data.income, "debt"),
  };
  const targets = {
    essential: roundMoney(baseTargets.essential + extrasByCat.essential),
    flexible: roundMoney(baseTargets.flexible + extrasByCat.flexible),
    investing: roundMoney(baseTargets.investing + extrasByCat.investing),
    savings: roundMoney(baseTargets.savings + extrasByCat.savings),
    debt: roundMoney(baseTargets.debt + extrasByCat.debt),
  };
  const allocated = ALLOC_KEYS.reduce((s, k) => s + baseTargets[k], 0);
  const leftToBudget = roundMoney(data.income - allocated);
  const percentSum = ALLOC_KEYS.reduce((s, k) => s + (profile.percents[k] ?? 0), 0);
  return {
    income: data.income,
    essential,
    flexible,
    investing,
    savings,
    debt,
    extras,
    expenses,
    savedInv,
    leftover,
    targets,
    allocated,
    leftToBudget,
    percentSum,
  };
}

export interface YearRow {
  month: string;
  income: number;
  expenses: number;
  saved: number;
  invested: number;
  debt: number;
  leftover: number;
}

export function yearRows(profile: Profile, year: string): YearRow[] {
  const keys = new Set<string>([
    ...Object.keys(profile.months).filter((k) => k.startsWith(year)),
    ...(profile.transactions ?? []).filter((t) => t.date.startsWith(year)).map((t) => t.date.slice(0, 7)),
  ]);
  for (const r of profile.recurring ?? []) {
    if (r.active === false) continue;
    for (const k of Object.keys(profile.months)) if (k.startsWith(year)) keys.add(k);
  }
  return [...keys]
    .sort()
    .map((k) => {
      const s = monthSnapshot(profile, k);
      return {
        month: k.slice(5),
        income: s.income + s.extras,
        expenses: s.expenses,
        saved: s.savings,
        invested: s.investing,
        debt: s.debt,
        leftover: s.leftover,
      };
    });
}

export function yearOfMonth(monthKey: string) {
  return yearOf(monthKey);
}

export function txSigned(t: Transaction) {
  if (t.type === "income") return t.amount;
  return -t.amount;
}

export function categoryToType(cat: CategoryId | "savings" | "debt" | "income"): Transaction["type"] {
  if (cat === "income") return "income";
  if (cat === "investing") return "investment";
  if (cat === "savings") return "saving";
  if (cat === "debt") return "debt-payment";
  return "expense";
}

export function rememberRecurring(
  memory: { name: string; amount: number; category: CategoryId }[] | undefined,
  entry: { name: string; amount: number; category: CategoryId },
) {
  const next = [
    entry,
    ...(memory ?? []).filter((m) => m.name.trim().toLowerCase() !== entry.name.trim().toLowerCase()),
  ];
  return next.slice(0, 24);
}

export function pendingAutos(profile: Profile, monthKey: string): {
  items: BudgetItem[];
  txs: Omit<Transaction, "id">[];
} {
  const data = monthOf(profile, monthKey);
  const txs = txsInMonth(profile, monthKey);
  const items: BudgetItem[] = [];
  const outTxs: Omit<Transaction, "id">[] = [];
  const date = `${monthKey}-01`;

  for (const r of profile.recurring ?? []) {
    if (!isRecurringDue(r, monthKey)) continue;
    if (txs.some((t) => t.recurringExpenseId === r.id)) continue;
    if (data.items.some((i) => i.sourceId === r.id)) continue;
    if (data.items.some((i) => i.name.toLowerCase() === r.name.toLowerCase() && i.category === r.category)) continue;
    const itemId = `auto-r-${r.id}-${monthKey}`;
    items.push({
      id: itemId,
      name: r.name,
      amount: r.amount,
      category: r.category,
      methodId: r.methodId,
      source: "recurring",
      sourceId: r.id,
    });
    outTxs.push({
      type: categoryToType(r.category),
      category: r.category,
      name: r.name,
      amount: r.amount,
      date,
      methodId: r.methodId,
      itemId,
      recurringExpenseId: r.id,
    });
  }

  for (const lp of profile.largePurchases ?? []) {
    if (!isLargeActive(lp, monthKey)) continue;
    if (txs.some((t) => t.largePurchaseId === lp.id)) continue;
    if (data.items.some((i) => i.sourceId === lp.id)) continue;
    const cat = (lp.category ?? "essential") as AllocKey;
    const amount = installmentOf(lp);
    if (isSpendCat(cat)) {
      const itemId = `auto-lp-${lp.id}-${monthKey}`;
      items.push({
        id: itemId,
        name: lp.name,
        amount,
        category: cat,
        methodId: lp.methodId,
        source: "large",
        sourceId: lp.id,
      });
      outTxs.push({
        type: categoryToType(cat),
        category: cat,
        name: lp.name,
        amount,
        date,
        itemId,
        largePurchaseId: lp.id,
        methodId: lp.methodId,
      });
    } else {
      outTxs.push({
        type: categoryToType(cat),
        category: cat,
        name: lp.name,
        amount,
        date,
        largePurchaseId: lp.id,
        methodId: lp.methodId,
      });
    }
  }

  for (const d of profile.debts ?? []) {
    if (!isDebtActive(d, monthKey)) continue;
    if (txs.some((t) => t.debtId === d.id)) continue;
    if (data.items.some((i) => i.sourceId === d.id)) continue;
    const cat = (d.category ?? "essential") as AllocKey;
    const amount = d.minPayment;
    if (amount <= 0) continue;
    if (isSpendCat(cat)) {
      const itemId = `auto-d-${d.id}-${monthKey}`;
      items.push({
        id: itemId,
        name: d.name,
        amount,
        category: cat,
        source: "debt",
        sourceId: d.id,
        methodId: d.methodId,
      });
      outTxs.push({
        type: categoryToType(cat),
        category: cat,
        name: d.name,
        amount,
        date,
        itemId,
        debtId: d.id,
        methodId: d.methodId,
      });
    } else {
      outTxs.push({
        type: categoryToType(cat),
        category: cat,
        name: d.name,
        amount,
        date,
        debtId: d.id,
        methodId: d.methodId,
      });
    }
  }

  for (const inf of profile.inflows ?? []) {
    if (!isInflowDue(inf, monthKey)) continue;
    if (txs.some((t) => t.inflowId === inf.id)) continue;
    outTxs.push({
      type: "income",
      category: inf.category,
      name: inf.name,
      amount: inf.amount,
      date,
      inflowId: inf.id,
    });
  }

  return { items, txs: outTxs };
}

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "./utils";
import { currentMonthKey, dateInMonth, isoToday, prevMonthKey } from "./dates";
import { createBudgetWiseStorage } from "./idb-storage";
import { categoryToType, emptyMonth, installmentOf, isDebtActive, isLargeActive, isSpendCat, pendingAutos, rememberRecurring, findMergeableItem, findMergeableTx } from "./budget";
import { detectVisitorLocale } from "./locale-detect";
import { fingerprintOf, parseNotification } from "./capture/parser";
import { guessCategory } from "./capture/quick";
import type { CapturedPurchaseSuggestion, DirectCapture, NotificationCandidate, WalletMethodMap } from "./capture/types";
import { roundMoney } from "./money";
import type { Lang } from "./i18n";
import type { CurrencyCode } from "./money";
import type { PaydownMethod } from "./debt";
import type {
  AllocKey,
  BudgetItem,
  CalcDraft,
  CategoryId,
  ExtraInflow,
  LargePurchase,
  MonthData,
  Profile,
  RecurringExpense,
  RecurringFreq,
  SavingsGoal,
  Transaction,
  TxCategory,
  TxType,
} from "./types";

export type {
  AllocKey,
  BudgetItem,
  CategoryId,
  LargePurchase,
  MonthData,
  Profile,
  RecurringExpense,
  RecurringFreq,
  SavingsGoal,
  Transaction,
  TxCategory,
  TxType,
};
export type { PaymentMethod } from "./types";
export { emptyMonth, largePurchaseForMonth } from "./budget";

export interface AppState {
  lang: Lang;
  theme: "dark" | "light";
  currency: CurrencyCode;
  advancedView: boolean;
  activeMonth: string;
  activeProfileId: string;
  profiles: Profile[];
  calc: CalcDraft;
  hydrated: boolean;
  setupComplete: boolean;
  hasUndoImport: boolean;
  cardOpen: Record<string, boolean>;
  smartTransactionCapture: boolean;
  tourComplete: boolean;
  setHydrated: (v: boolean) => void;
  setSetupComplete: (v: boolean) => void;
  setHasUndoImport: (v: boolean) => void;
  setCardOpen: (id: string, open: boolean) => void;
  setSmartCapture: (v: boolean) => void;
  setTourComplete: (v: boolean) => void;
  applyVisitorLocale: () => void;
  ingestNotification: (n: NotificationCandidate) => string | null;
  ingestCapture: (c: DirectCapture) => string | null;
  confirmSuggestion: (id: string, patch?: { name?: string; amount?: number; category?: CategoryId; methodId?: string; alwaysCategory?: boolean }) => void;
  dismissSuggestion: (id: string) => void;
  clearSuggestions: () => void;
  upsertWalletMap: (m: WalletMethodMap) => void;
  removeWalletMap: (sourceApp: string, lastFour?: string) => void;
  clearMerchantRules: () => void;
  setLang: (lang: Lang) => void;
  setTheme: (theme: "dark" | "light") => void;
  setCurrency: (c: CurrencyCode) => void;
  setAdvanced: (v: boolean) => void;
  setMonth: (m: string) => void;
  setCalc: (partial: Partial<CalcDraft>) => void;
  addProfile: (name: string) => void;
  removeProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;
  setActiveProfile: (id: string) => void;
  patchProfile: (fn: (p: Profile) => Profile) => void;
  ensureMonth: () => void;
  setIncome: (n: number) => void;
  addItem: (item: Omit<BudgetItem, "id">) => void;
  updateItem: (id: string, patch: Partial<BudgetItem>) => void;
  removeItem: (id: string) => void;
  addPaymentMethod: (name: string, color: string) => void;
  updatePaymentMethod: (id: string, patch: { name?: string; color?: string }) => void;
  removePaymentMethod: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateGoal: (id: string, patch: Partial<SavingsGoal>) => void;
  removeGoal: (id: string) => void;
  setGoalContribution: (id: string, amount: number, methodId?: string) => void;
  addDebt: (debt: Omit<import("./debt").Debt, "id">) => void;
  updateDebt: (id: string, patch: Partial<import("./debt").Debt>) => void;
  removeDebt: (id: string) => void;
  setDebtMethod: (m: PaydownMethod) => void;
  setExtraPayment: (n: number) => void;
  setAssets: (patch: Partial<Profile["assets"]>) => void;
  setPercent: (key: AllocKey, n: number) => void;
  setAdjustment: (key: AllocKey, n: number) => void;
  addLarge: (p: Omit<LargePurchase, "id">) => void;
  updateLarge: (id: string, patch: Partial<LargePurchase>) => void;
  removeLarge: (id: string) => void;
  skipLarge: (id: string) => void;
  skipDebt: (id: string) => void;
  addRecurring: (r: Omit<RecurringExpense, "id">) => void;
  updateRecurring: (id: string, patch: Partial<RecurringExpense>) => void;
  removeRecurring: (id: string) => void;
  toggleRecurring: (id: string, active: boolean) => void;
  skipRecurring: (id: string) => void;
  logRecurring: (id: string) => void;
  applyAutosForMonth: (monthKey?: string) => void;
  addInflow: (inf: Omit<ExtraInflow, "id">) => void;
  updateInflow: (id: string, patch: Partial<ExtraInflow>) => void;
  removeInflow: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  copyPreviousMonth: () => void;
  setAiTip: (tip: string, tipId?: string) => void;
  restoreSample: () => void;
  resetProfile: () => void;
  importProfiles: (profiles: Profile[], extras?: Partial<Pick<AppState, "lang" | "theme" | "currency" | "advancedView" | "activeMonth" | "activeProfileId" | "calc">>) => void;
}

const METHOD_COLORS = ["#22c55e", "#6e7bff", "#111827", "#94a3b8", "#0ea5e9", "#f97316", "#e11d48"];

const DEFAULT_PERCENTS: Record<AllocKey, number> = {
  essential: 80,
  flexible: 10,
  investing: 10,
  savings: 0,
  debt: 0,
};

const ZERO_ADJ: Record<AllocKey, number> = {
  essential: 0,
  flexible: 0,
  investing: 0,
  savings: 0,
  debt: 0,
};

function emptyProfile(name: string): Profile {
  return {
    id: uid(),
    name,
    paymentMethods: [
      { id: uid(), name: "Cash", color: "#22c55e", type: "cash" },
      { id: uid(), name: "Amex", color: "#1d4ed8", type: "credit-card" },
      { id: uid(), name: "Etoro Visa Black Platinum", color: "#0b0b0f", type: "broker-card" },
      { id: uid(), name: "Trade Republic", color: "#94a3b8", type: "broker-card" },
      { id: uid(), name: "C24 Bank", color: "#0ea5e9", type: "bank" },
    ],
    months: {},
    goals: [],
    debts: [],
    largePurchases: [],
    recurring: [],
    recurringMemory: [],
    inflows: [],
    transactions: [],
    assets: { cash: 0, bank: 0, savings: 0, investments: 0, property: 0, other: 0 },
    percents: { ...DEFAULT_PERCENTS },
    adjustments: { ...ZERO_ADJ },
    debtMethod: "avalanche",
    extraDebtPayment: 100,
    aiTip: "",
  };
}

function txFromItem(item: BudgetItem, monthKey: string, day: number): Transaction {
  return {
    id: uid(),
    type: categoryToType(item.category),
    category: item.category,
    name: item.name,
    amount: item.amount,
    date: dateInMonth(monthKey, day),
    methodId: item.methodId,
    itemId: item.id,
  };
}

function sampleProfile(name: string, month: string): Profile {
  const cashId = "pm-cash";
  const amexId = "pm-amex";
  const etoroId = "pm-etoro";
  const trId = "pm-tr";
  const c24Id = "pm-c24";
  const emergencyId = "goal-emergency";
  const items: BudgetItem[] = [
    { id: "it-food", name: "Groceries", amount: 340, category: "essential", methodId: amexId },
    { id: "it-util", name: "Electricity & gas", amount: 95, category: "essential", methodId: c24Id },
    { id: "it-trans", name: "Transportation", amount: 85, category: "essential", methodId: cashId },
    { id: "it-etf", name: "World ETF", amount: 300, category: "investing", methodId: trId },
    { id: "it-dine", name: "Restaurants", amount: 75, category: "flexible", methodId: amexId },
  ];
  const transactions: Transaction[] = [
    {
      id: "tx-salary",
      type: "income",
      category: "income",
      name: "Salary",
      amount: 4044.72,
      date: dateInMonth(month, 1),
      methodId: c24Id,
    },
    ...items.map((it, i) => txFromItem(it, month, [4, 6, 8, 12, 15][i] ?? 12)),
    {
      id: "tx-emergency",
      type: "saving",
      category: "savings",
      name: "Emergency Fund",
      amount: 150,
      date: dateInMonth(month, 2),
      methodId: c24Id,
      goalId: emergencyId,
    },
  ];
  return {
    id: "main",
    name,
    paymentMethods: [
      { id: cashId, name: "Cash", color: "#22c55e", type: "cash" },
      { id: amexId, name: "Amex", color: "#1d4ed8", type: "credit-card" },
      { id: etoroId, name: "Etoro Visa Black Platinum", color: "#0b0b0f", type: "broker-card" },
      { id: trId, name: "Trade Republic", color: "#94a3b8", type: "broker-card" },
      { id: c24Id, name: "C24 Bank", color: "#0ea5e9", type: "bank" },
    ],
    months: {
      [month]: {
        income: 4044.72,
        items,
        goalContributions: { [emergencyId]: 150 },
      },
    },
    goals: [{ id: emergencyId, name: "Emergency Fund", target: 5000, current: 800 }],
    debts: [
      { id: "d-visa", name: "Visa", balance: 2800, ratePct: 22.9, minPayment: 70, category: "essential" },
      { id: "d-car", name: "Car loan", balance: 950, ratePct: 4.5, minPayment: 90, category: "essential" },
      { id: "d-personal", name: "Personal loan", balance: 6200, ratePct: 9.5, minPayment: 140, category: "essential" },
    ],
    largePurchases: [],
    recurring: [
      { id: "rc-rent", name: "Rent / Mortgage", amount: 980, category: "essential", methodId: c24Id, frequency: "monthly", active: true },
      { id: "rc-phone", name: "Phone", amount: 24.99, category: "essential", methodId: c24Id, frequency: "monthly", active: true },
      { id: "rc-netflix", name: "Netflix", amount: 12.99, category: "flexible", methodId: amexId, frequency: "monthly", active: true },
    ],
    recurringMemory: [
      { name: "Rent / Mortgage", amount: 980, category: "essential" },
      { name: "Phone", amount: 24.99, category: "essential" },
      { name: "Netflix", amount: 12.99, category: "flexible" },
    ],
    inflows: [
      {
        id: "inf-etoro-pi",
        name: "eToro Popular Investor",
        amount: 85,
        category: "investing",
        recurring: true,
        frequency: "monthly",
        startMonth: month,
        active: true,
      },
      {
        id: "inf-etoro-cb",
        name: "eToro Visa cashback",
        amount: 22,
        category: "investing",
        recurring: true,
        frequency: "monthly",
        startMonth: month,
        active: true,
      },
    ],
    transactions,
    assets: { cash: 320, bank: 1850, savings: 800, investments: 4200, property: 0, other: 0 },
    percents: { essential: 80, investing: 10, flexible: 10, savings: 0, debt: 0 },
    adjustments: { ...ZERO_ADJ },
    debtMethod: "avalanche",
    extraDebtPayment: 100,
    aiTip: "",
    tipId: "",
  };
}

const month = currentMonthKey();
const initialProfile = sampleProfile("Main", month);

function withActive(state: AppState, fn: (p: Profile) => Profile): Partial<AppState> {
  return {
    profiles: state.profiles.map((p) => (p.id === state.activeProfileId ? fn(p) : p)),
  };
}

function withMonth(p: Profile, monthKey: string, fn: (m: MonthData) => MonthData): Profile {
  const current = p.months[monthKey] ?? emptyMonth();
  return { ...p, months: { ...p.months, [monthKey]: fn(current) } };
}

function normalizeProfile(p: Profile): Profile {
  return {
    ...p,
    transactions: p.transactions ?? [],
    percents: { ...DEFAULT_PERCENTS, ...p.percents },
    adjustments: { ...ZERO_ADJ, ...p.adjustments },
    largePurchases: (p.largePurchases ?? []).map((lp) => ({
      paidMonths: 0,
      skippedMonths: [],
      ...lp,
      category: lp.category ?? "essential",
    })),
    recurring: (p.recurring ?? []).map((r) => ({
      frequency: "monthly" as const,
      skippedMonths: [],
      ...r,
      active: r.active ?? true,
    })),
    recurringMemory: p.recurringMemory ?? [],
    inflows: (p.inflows ?? []).map((inf) => {
      const now = currentMonthKey();
      if (inf.startMonth && inf.startMonth > now) return { ...inf, startMonth: now };
      return inf;
    }),
    debts: (p.debts ?? []).map((d) => ({
      skippedMonths: [],
      ...d,
      category: d.category ?? "essential",
    })),
    captureSuggestions: p.captureSuggestions ?? [],
    merchantCategoryRules: p.merchantCategoryRules ?? [],
    walletMethodMaps: p.walletMethodMaps ?? [],
  };
}

function applyAutos(p: Profile, monthKey: string, date: string): Profile {
  const pending = pendingAutos(p, monthKey);
  if (pending.items.length === 0 && pending.txs.length === 0) return p;
  const next = withMonth(p, monthKey, (m) => ({
    ...m,
    items: [...m.items, ...pending.items],
  }));
  let goals = next.goals;
  for (const tx of pending.txs) {
    if (!tx.largePurchaseId) continue;
    const lp = p.largePurchases.find((x) => x.id === tx.largePurchaseId);
    if (!lp?.fundFromGoalId) continue;
    goals = goals.map((g) =>
      g.id === lp.fundFromGoalId ? { ...g, current: roundMoney(g.current + tx.amount) } : g,
    );
  }
  return {
    ...next,
    goals,
    transactions: [
      ...next.transactions,
      ...pending.txs.map((t) => ({ ...t, id: uid(), date })),
    ],
  };
}

function defaultDate(monthKey: string) {
  const today = isoToday();
  return today.startsWith(monthKey) ? today : dateInMonth(monthKey, 1);
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      lang: "en",
      theme: "dark",
      currency: "EUR",
      advancedView: true,
      activeMonth: month,
      activeProfileId: initialProfile.id,
      profiles: [initialProfile],
      calc: {
        mode: "save",
        goal: 10000,
        principal: 1000,
        pmt: 100,
        annualRatePct: 7,
        years: 10,
        freq: "monthly",
        timing: "end",
      },
      hydrated: false,
      setupComplete: true,
      hasUndoImport: false,
      cardOpen: {},
      smartTransactionCapture: false,
      tourComplete: false,
      setHydrated: (v) => set({ hydrated: v }),
      setSetupComplete: (setupComplete) => set({ setupComplete }),
      setHasUndoImport: (hasUndoImport) => set({ hasUndoImport }),
      setCardOpen: (id, open) => set({ cardOpen: { ...get().cardOpen, [id]: open } }),
      setSmartCapture: (smartTransactionCapture) => set({ smartTransactionCapture }),
      setTourComplete: (tourComplete) => set({ tourComplete }),
      applyVisitorLocale: () => {
        if (typeof window === "undefined") return;
        const d = detectVisitorLocale();
        set({ lang: d.lang, currency: d.currency });
      },
      ingestNotification: (n) => {
        const s = get();
        if (!s.smartTransactionCapture) return null;
        const p = s.profiles.find((x) => x.id === s.activeProfileId) ?? s.profiles[0];
        if (!p) return null;
        const parsed = parseNotification(n, {
          currency: s.currency,
          items: [
            ...(p.months[s.activeMonth]?.items ?? []),
            ...p.recurring,
          ].map((it) => ({ name: it.name, category: it.category })),
          methods: p.paymentMethods.map((m) => ({ id: m.id, name: m.name })),
          rules: p.merchantCategoryRules ?? [],
          maps: p.walletMethodMaps ?? [],
        });
        if (parsed.eventKind === "declined") return null;
        if (parsed.amountMinor == null || parsed.amountMinor <= 0) return null;
        const existing = (p.captureSuggestions ?? []).find(
          (c) => c.fingerprint === parsed.fingerprint && c.status === "pending",
        );
        const id = existing?.id ?? uid();
        const suggestion: CapturedPurchaseSuggestion = {
          id,
          status: "pending",
          source: "android_notification",
          sourceAppPackage: n.packageName,
          sourceAppLabel: n.appLabel,
          ...parsed,
          detectedAt: new Date().toISOString(),
        };
        set(
          withActive(s, (cur) => ({
            ...cur,
            captureSuggestions: [
              suggestion,
              ...(cur.captureSuggestions ?? []).filter((c) => c.id !== id),
            ],
          })),
        );
        return id;
      },
      ingestCapture: (c) => {
        const s = get();
        const p = s.profiles.find((x) => x.id === s.activeProfileId) ?? s.profiles[0];
        if (!p || !(c.amount > 0)) return null;
        const merchant = c.merchant.trim() || "Compra";
        const pkg = c.source === "ios_shortcut" ? "apple.wallet" : c.source;
        const parsed = parseNotification(
          { packageName: pkg, title: merchant, text: c.card ? `•••• ${c.card}` : "", postedAt: c.occurredAt ?? Date.now() },
          {
            currency: s.currency,
            items: [...(p.months[s.activeMonth]?.items ?? []), ...p.recurring].map((it) => ({ name: it.name, category: it.category })),
            methods: p.paymentMethods.map((m) => ({ id: m.id, name: m.name })),
            rules: p.merchantCategoryRules ?? [],
            maps: p.walletMethodMaps ?? [],
          },
        );
        const guess = guessCategory(parsed.merchantNormalized, p.merchantCategoryRules ?? [], [
          ...(p.months[s.activeMonth]?.items ?? []),
          ...p.recurring,
        ]);
        const amountMinor = Math.round(c.amount * 100);
        const fingerprint = fingerprintOf({
          merchantNormalized: parsed.merchantNormalized,
          amountMinor,
          day: parsed.occurredAt.slice(0, 10),
          lastFour: c.card ?? parsed.cardLastFour,
          pkg,
        });
        const all = p.captureSuggestions ?? [];
        const dupe = all.find((x) => x.fingerprint === fingerprint && Date.now() - Date.parse(x.detectedAt) < 10 * 60_000);
        if (dupe) return dupe.id;
        const id = uid();
        const suggestion: CapturedPurchaseSuggestion = {
          ...parsed,
          id,
          status: "pending",
          source: c.source,
          sourceAppPackage: pkg,
          sourceAppLabel: c.source === "ios_shortcut" ? "Apple Pay" : c.source === "share" ? "Share" : "Wallet",
          walletChannel: c.source === "ios_shortcut" ? "apple_pay" : parsed.walletChannel,
          amountMinor,
          currencyCode: c.currency || s.currency,
          cardLastFour: c.card ?? parsed.cardLastFour,
          categoryId: parsed.categoryId ?? guess.category,
          categoryConfidence: parsed.categoryId ? parsed.categoryConfidence : guess.confidence,
          fingerprint,
          detectedAt: new Date().toISOString(),
        };
        set({
          smartTransactionCapture: true,
          ...withActive(s, (cur) => ({ ...cur, captureSuggestions: [suggestion, ...(cur.captureSuggestions ?? [])].slice(0, 200) })),
        });
        return id;
      },
      confirmSuggestion: (id, patch) => {
        const s = get();
        const p = s.profiles.find((x) => x.id === s.activeProfileId) ?? s.profiles[0];
        const sug = (p.captureSuggestions ?? []).find((c) => c.id === id);
        if (!sug || sug.status !== "pending") return;
        const amount = patch?.amount ?? (sug.amountMinor != null ? sug.amountMinor / 100 : 0);
        const name = (patch?.name ?? sug.merchantNormalized).trim();
        const category = patch?.category ?? sug.categoryId ?? "essential";
        const methodId = patch?.methodId ?? sug.paymentMethodId ?? undefined;
        if (!name || amount <= 0) return;
        get().addItem({ name, amount, category, methodId });
        set(
          withActive(get(), (cur) => ({
            ...cur,
            captureSuggestions: (cur.captureSuggestions ?? []).map((c) =>
              c.id === id ? { ...c, status: "accepted" as const } : c,
            ),
            merchantCategoryRules:
              patch?.alwaysCategory
                ? [
                    { merchant: name, categoryId: category },
                    ...(cur.merchantCategoryRules ?? []).filter((r) => r.merchant.toLowerCase() !== name.toLowerCase()),
                  ]
                : cur.merchantCategoryRules,
          })),
        );
      },
      dismissSuggestion: (id) =>
        set(
          withActive(get(), (p) => ({
            ...p,
            captureSuggestions: (p.captureSuggestions ?? []).map((c) =>
              c.id === id ? { ...c, status: "dismissed" as const } : c,
            ),
          })),
        ),
      clearSuggestions: () =>
        set(
          withActive(get(), (p) => ({
            ...p,
            captureSuggestions: (p.captureSuggestions ?? []).filter((c) => c.status === "accepted"),
          })),
        ),
      upsertWalletMap: (m) =>
        set(
          withActive(get(), (p) => ({
            ...p,
            walletMethodMaps: [
              m,
              ...(p.walletMethodMaps ?? []).filter(
                (x) => !(x.sourceApp === m.sourceApp && (x.lastFour ?? "") === (m.lastFour ?? "")),
              ),
            ],
          })),
        ),
      removeWalletMap: (sourceApp, lastFour) =>
        set(
          withActive(get(), (p) => ({
            ...p,
            walletMethodMaps: (p.walletMethodMaps ?? []).filter(
              (x) => !(x.sourceApp === sourceApp && (x.lastFour ?? "") === (lastFour ?? "")),
            ),
          })),
        ),
      clearMerchantRules: () => set(withActive(get(), (p) => ({ ...p, merchantCategoryRules: [] }))),
      setLang: (lang) => set({ lang }),
      setTheme: (theme) => set({ theme }),
      setCurrency: (currency) => set({ currency }),
      setAdvanced: (advancedView) => set({ advancedView }),
      setMonth: (activeMonth) => {
        set({ activeMonth });
        const s = get();
        set(withActive(s, (p) => applyAutos(p, activeMonth, defaultDate(activeMonth))));
      },
      setCalc: (partial) => set({ calc: { ...get().calc, ...partial } }),
      addProfile: (name) => {
        const p = emptyProfile(name || "Profile");
        set({ profiles: [...get().profiles, p], activeProfileId: p.id });
      },
      removeProfile: (id) => {
        const { profiles, activeProfileId } = get();
        if (profiles.length <= 1) return;
        const next = profiles.filter((p) => p.id !== id);
        set({
          profiles: next,
          activeProfileId: activeProfileId === id ? next[0].id : activeProfileId,
        });
      },
      renameProfile: (id, name) =>
        set({ profiles: get().profiles.map((p) => (p.id === id ? { ...p, name } : p)) }),
      setActiveProfile: (id) => set({ activeProfileId: id }),
      patchProfile: (fn) => set(withActive(get(), fn)),
      ensureMonth: () => {
        const s = get();
        set(
          withActive(s, (p) => {
            if (p.months[s.activeMonth]) return p;
            return { ...p, months: { ...p.months, [s.activeMonth]: emptyMonth() } };
          }),
        );
      },
      setIncome: (n) => {
        const s = get();
        set(withActive(s, (p) => withMonth(p, s.activeMonth, (m) => ({ ...m, income: n }))));
      },
      addItem: (item) => {
        const s = get();
        const date = defaultDate(s.activeMonth);
        set(
          withActive(s, (p) => {
            const m = p.months[s.activeMonth] ?? emptyMonth();
            const existing = findMergeableItem(m.items, item);
            if (existing) {
              const amount = roundMoney(existing.amount + item.amount);
              const methodId = item.methodId || existing.methodId;
              const next = withMonth(p, s.activeMonth, (cur) => ({
                ...cur,
                items: cur.items.map((it) => (it.id === existing.id ? { ...it, amount, methodId } : it)),
              }));
              return {
                ...next,
                transactions: [
                  ...next.transactions,
                  {
                    id: uid(),
                    type: categoryToType(item.category),
                    category: item.category,
                    name: existing.name,
                    amount: item.amount,
                    date,
                    methodId,
                    itemId: existing.id,
                  },
                ],
              };
            }
            const id = uid();
            const next = withMonth(p, s.activeMonth, (cur) => ({
              ...cur,
              items: [...cur.items, { ...item, id }],
            }));
            return {
              ...next,
              transactions: [
                ...next.transactions,
                {
                  id: uid(),
                  type: categoryToType(item.category),
                  category: item.category,
                  name: item.name,
                  amount: item.amount,
                  date,
                  methodId: item.methodId,
                  itemId: id,
                },
              ],
            };
          }),
        );
      },
      updateItem: (id, patch) => {
        const s = get();
        set(
          withActive(s, (p) => {
            const next = withMonth(p, s.activeMonth, (m) => ({
              ...m,
              items: m.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
            }));
            return {
              ...next,
              transactions: next.transactions.map((t) =>
                t.itemId === id
                  ? {
                      ...t,
                      name: patch.name ?? t.name,
                      amount: patch.amount ?? t.amount,
                      methodId: patch.methodId ?? t.methodId,
                      category: patch.category ?? t.category,
                      type: patch.category ? categoryToType(patch.category) : t.type,
                    }
                  : t,
              ),
            };
          }),
        );
      },
      removeItem: (id) => {
        const s = get();
        set(
          withActive(s, (p) => {
            const next = withMonth(p, s.activeMonth, (m) => ({
              ...m,
              items: m.items.filter((it) => it.id !== id),
            }));
            return { ...next, transactions: next.transactions.filter((t) => t.itemId !== id) };
          }),
        );
      },
      addPaymentMethod: (name, color) =>
        set(
          withActive(get(), (p) => ({
            ...p,
            paymentMethods: [
              ...p.paymentMethods,
              {
                id: uid(),
                name,
                color: color || METHOD_COLORS[p.paymentMethods.length % METHOD_COLORS.length],
              },
            ],
          })),
        ),
      updatePaymentMethod: (id, patch) =>
        set(
          withActive(get(), (p) => ({
            ...p,
            paymentMethods: p.paymentMethods.map((m) => (m.id === id ? { ...m, ...patch } : m)),
          })),
        ),
      removePaymentMethod: (id) =>
        set(
          withActive(get(), (p) => ({
            ...p,
            paymentMethods: p.paymentMethods.filter((m) => m.id !== id),
          })),
        ),
      addGoal: (goal) => set(withActive(get(), (p) => ({ ...p, goals: [...p.goals, { ...goal, id: uid() }] }))),
      updateGoal: (id, patch) =>
        set(
          withActive(get(), (p) => ({
            ...p,
            goals: p.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
            transactions: p.transactions.map((t) =>
              t.goalId === id && patch.name ? { ...t, name: patch.name } : t,
            ),
          })),
        ),
      removeGoal: (id) => set(withActive(get(), (p) => ({ ...p, goals: p.goals.filter((g) => g.id !== id) }))),
      setGoalContribution: (id, amount, methodId) => {
        const s = get();
        set(
          withActive(s, (p) => {
            const next = withMonth(p, s.activeMonth, (m) => ({
              ...m,
              goalContributions: { ...m.goalContributions, [id]: amount },
            }));
            const goal = p.goals.find((g) => g.id === id);
            const existing = next.transactions.find(
              (t) => t.goalId === id && t.date.startsWith(s.activeMonth),
            );
            let transactions = next.transactions;
            if (amount <= 0) {
              transactions = transactions.filter((t) => t.id !== existing?.id);
            } else if (existing) {
              transactions = transactions.map((t) =>
                t.id === existing.id
                  ? { ...t, amount, methodId: methodId !== undefined ? methodId || undefined : t.methodId }
                  : t,
              );
            } else {
              transactions = [
                ...transactions,
                {
                  id: uid(),
                  type: "saving",
                  category: "savings",
                  name: goal?.name ?? "Savings",
                  amount,
                  date: defaultDate(s.activeMonth),
                  goalId: id,
                  methodId: methodId || undefined,
                },
              ];
            }
            return { ...next, transactions };
          }),
        );
      },
      addDebt: (debt) => {
        const s = get();
        const next = {
          ...debt,
          id: uid(),
          category: debt.category ?? "essential",
          skippedMonths: [],
        };
        set(
          withActive(s, (p) =>
            applyAutos({ ...p, debts: [...p.debts, next] }, s.activeMonth, defaultDate(s.activeMonth)),
          ),
        );
      },
      updateDebt: (id, patch) => {
        const s = get();
        set(
          withActive(s, (p) => {
            const prev = p.debts.find((x) => x.id === id);
            if (!prev) return p;
            const next = { ...prev, ...patch };
            const month = s.activeMonth;
            const cat = (next.category ?? "essential") as AllocKey;
            const active = isDebtActive(next, month);
            const m = p.months[month] ?? emptyMonth();
            let items = m.items;
            let txs = p.transactions;

            if (active) {
              txs = txs.map((t) =>
                t.debtId === id && t.date.startsWith(month)
                  ? {
                      ...t,
                      name: next.name,
                      amount: next.minPayment,
                      category: cat,
                      type: categoryToType(cat),
                    }
                  : t,
              );
              const itemCat = isSpendCat(cat) ? cat : null;
              if (itemCat) {
                if (items.some((it) => it.source === "debt" && it.sourceId === id)) {
                  items = items.map((it) =>
                    it.source === "debt" && it.sourceId === id
                      ? { ...it, name: next.name, amount: next.minPayment, category: itemCat }
                      : it,
                  );
                } else {
                  const itemId = `auto-d-${id}-${month}`;
                  items = [
                    ...items,
                    {
                      id: itemId,
                      name: next.name,
                      amount: next.minPayment,
                      category: itemCat,
                      source: "debt",
                      sourceId: id,
                    },
                  ];
                  if (!txs.some((t) => t.debtId === id && t.date.startsWith(month))) {
                    txs = [
                      ...txs,
                      {
                        id: uid(),
                        type: categoryToType(itemCat),
                        category: itemCat,
                        name: next.name,
                        amount: next.minPayment,
                        date: defaultDate(month),
                        itemId,
                        debtId: id,
                      },
                    ];
                  }
                }
              } else {
                items = items.filter((it) => !(it.source === "debt" && it.sourceId === id));
              }
            } else {
              items = items.filter((it) => !(it.source === "debt" && it.sourceId === id));
              txs = txs.filter((t) => !(t.debtId === id && t.date.startsWith(month)));
            }

            return {
              ...p,
              debts: p.debts.map((d) => (d.id === id ? next : d)),
              transactions: txs,
              months: { ...p.months, [month]: { ...m, items } },
            };
          }),
        );
      },
      removeDebt: (id) => {
        const s = get();
        set(
          withActive(s, (p) => {
            const month = s.activeMonth;
            const m = p.months[month] ?? emptyMonth();
            return {
              ...p,
              debts: p.debts.filter((d) => d.id !== id),
              transactions: p.transactions.filter((t) => t.debtId !== id),
              months: {
                ...p.months,
                [month]: { ...m, items: m.items.filter((i) => !(i.source === "debt" && i.sourceId === id)) },
              },
            };
          }),
        );
      },
      skipDebt: (id) => {
        const s = get();
        set(
          withActive(s, (p) => ({
            ...p,
            debts: p.debts.map((d) =>
              d.id === id ? { ...d, skippedMonths: [...(d.skippedMonths ?? []), s.activeMonth] } : d,
            ),
            transactions: p.transactions.filter(
              (t) => !(t.debtId === id && t.date.startsWith(s.activeMonth)),
            ),
            months: {
              ...p.months,
              [s.activeMonth]: {
                ...(p.months[s.activeMonth] ?? emptyMonth()),
                items: (p.months[s.activeMonth]?.items ?? []).filter(
                  (i) => !(i.source === "debt" && i.sourceId === id),
                ),
              },
            },
          })),
        );
      },
      setDebtMethod: (debtMethod) => set(withActive(get(), (p) => ({ ...p, debtMethod }))),
      setExtraPayment: (extraDebtPayment) => set(withActive(get(), (p) => ({ ...p, extraDebtPayment }))),
      setAssets: (patch) => set(withActive(get(), (p) => ({ ...p, assets: { ...p.assets, ...patch } }))),
      setPercent: (key, n) =>
        set(withActive(get(), (p) => ({ ...p, percents: { ...p.percents, [key]: n } }))),
      setAdjustment: (key, n) =>
        set(withActive(get(), (p) => ({ ...p, adjustments: { ...p.adjustments, [key]: n } }))),
      addLarge: (lp) => {
        const s = get();
        const id = uid();
        const purchase: LargePurchase = {
          ...lp,
          id,
          category: lp.category ?? "essential",
          paidMonths: 0,
          skippedMonths: [],
        };
        set(
          withActive(s, (p) => {
            let goals = p.goals;
            if (purchase.fundFromGoalId) {
              goals = goals.map((g) =>
                g.id === purchase.fundFromGoalId
                  ? { ...g, current: roundMoney(g.current - purchase.total) }
                  : g,
              );
            }
            return applyAutos(
              { ...p, goals, largePurchases: [...p.largePurchases, purchase] },
              s.activeMonth,
              defaultDate(s.activeMonth),
            );
          }),
        );
      },
      updateLarge: (id, patch) => {
        const s = get();
        set(
          withActive(s, (p) => {
            const prev = p.largePurchases.find((x) => x.id === id);
            if (!prev) return p;
            const nextLp: LargePurchase = { ...prev, ...patch };
            const month = s.activeMonth;
            const inst = installmentOf(nextLp);
            const cat = (nextLp.category ?? "essential") as AllocKey;
            const active = isLargeActive(nextLp, month);
            const oldRepaid = p.transactions
              .filter((t) => t.largePurchaseId === id)
              .reduce((sum, t) => sum + t.amount, 0);
            const oldOut = prev.fundFromGoalId ? Math.max(0, prev.total - oldRepaid) : 0;

            const m = p.months[month] ?? emptyMonth();
            let items = m.items;
            let txs = p.transactions;

            if (active) {
              txs = txs.map((t) =>
                t.largePurchaseId === id && t.date.startsWith(month)
                  ? {
                      ...t,
                      name: nextLp.name,
                      amount: inst,
                      category: cat,
                      type: categoryToType(cat),
                    }
                  : t,
              );
              const itemCat = cat === "essential" || cat === "flexible" || cat === "investing" ? cat : null;
              if (itemCat) {
                if (items.some((it) => it.sourceId === id)) {
                  items = items.map((it) =>
                    it.sourceId === id
                      ? { ...it, name: nextLp.name, amount: inst, category: itemCat }
                      : it,
                  );
                } else {
                  const itemId = `auto-lp-${id}-${month}`;
                  items = [
                    ...items,
                    {
                      id: itemId,
                      name: nextLp.name,
                      amount: inst,
                      category: itemCat,
                      source: "large",
                      sourceId: id,
                    },
                  ];
                  if (!txs.some((t) => t.largePurchaseId === id && t.date.startsWith(month))) {
                    txs = [
                      ...txs,
                      {
                        id: uid(),
                        type: categoryToType(itemCat),
                        category: itemCat,
                        name: nextLp.name,
                        amount: inst,
                        date: defaultDate(month),
                        itemId,
                        largePurchaseId: id,
                      },
                    ];
                  }
                }
              } else {
                items = items.filter((it) => it.sourceId !== id);
              }
            } else {
              items = items.filter((it) => it.sourceId !== id);
              txs = txs.filter((t) => !(t.largePurchaseId === id && t.date.startsWith(month)));
            }

            const repaid = txs.filter((t) => t.largePurchaseId === id).reduce((sum, t) => sum + t.amount, 0);
            const newOut = nextLp.fundFromGoalId ? Math.max(0, nextLp.total - repaid) : 0;

            let goals = p.goals;
            if (prev.fundFromGoalId && oldOut) {
              goals = goals.map((g) =>
                g.id === prev.fundFromGoalId ? { ...g, current: roundMoney(g.current + oldOut) } : g,
              );
            }
            if (nextLp.fundFromGoalId && newOut) {
              goals = goals.map((g) =>
                g.id === nextLp.fundFromGoalId ? { ...g, current: roundMoney(g.current - newOut) } : g,
              );
            }

            return {
              ...p,
              goals,
              largePurchases: p.largePurchases.map((x) => (x.id === id ? nextLp : x)),
              transactions: txs,
              months: { ...p.months, [month]: { ...m, items } },
            };
          }),
        );
      },
      removeLarge: (id) =>
        set(
          withActive(get(), (p) => {
            const lp = p.largePurchases.find((x) => x.id === id);
            const repaid = p.transactions
              .filter((t) => t.largePurchaseId === id)
              .reduce((s, t) => s + t.amount, 0);
            let goals = p.goals;
            if (lp?.fundFromGoalId) {
              const stillOut = Math.max(0, lp.total - repaid);
              goals = goals.map((g) =>
                g.id === lp.fundFromGoalId ? { ...g, current: roundMoney(g.current + stillOut) } : g,
              );
            }
            return {
              ...p,
              goals,
              largePurchases: p.largePurchases.filter((x) => x.id !== id),
              transactions: p.transactions.filter((t) => t.largePurchaseId !== id),
            };
          }),
        ),
      skipLarge: (id) => {
        const s = get();
        set(
          withActive(s, (p) => {
            const lp = p.largePurchases.find((x) => x.id === id);
            const hadTx = p.transactions.some(
              (t) => t.largePurchaseId === id && t.date.startsWith(s.activeMonth),
            );
            let goals = p.goals;
            if (hadTx && lp?.fundFromGoalId) {
              const inst = installmentOf(lp);
              goals = goals.map((g) =>
                g.id === lp.fundFromGoalId ? { ...g, current: roundMoney(g.current - inst) } : g,
              );
            }
            return {
              ...p,
              goals,
              largePurchases: p.largePurchases.map((x) =>
                x.id === id ? { ...x, skippedMonths: [...(x.skippedMonths ?? []), s.activeMonth] } : x,
              ),
              transactions: p.transactions.filter(
                (t) => !(t.largePurchaseId === id && t.date.startsWith(s.activeMonth)),
              ),
              months: {
                ...p.months,
                [s.activeMonth]: {
                  ...(p.months[s.activeMonth] ?? emptyMonth()),
                  items: (p.months[s.activeMonth]?.items ?? []).filter((i) => i.sourceId !== id),
                },
              },
            };
          }),
        );
      },
      addRecurring: (r) => {
        const s = get();
        const rec: RecurringExpense = {
          ...r,
          id: uid(),
          active: r.active ?? true,
          skippedMonths: [],
          frequency: r.frequency ?? "monthly",
          startMonth: r.startMonth ?? s.activeMonth,
        };
        set(
          withActive(s, (p) =>
            applyAutos(
              {
                ...p,
                recurring: [...p.recurring, rec],
                recurringMemory: rememberRecurring(p.recurringMemory, {
                  name: rec.name,
                  amount: rec.amount,
                  category: rec.category,
                }),
              },
              s.activeMonth,
              defaultDate(s.activeMonth),
            ),
          ),
        );
      },
      updateRecurring: (id, patch) => {
        const s = get();
        set(
          withActive(s, (p) => {
            const prev = p.recurring.find((x) => x.id === id);
            if (!prev) return p;
            const nextRec = { ...prev, ...patch };
            const month = s.activeMonth;
            const next = withMonth(p, month, (m) => ({
              ...m,
              items: m.items.map((it) =>
                it.sourceId === id
                  ? {
                      ...it,
                      name: nextRec.name,
                      amount: nextRec.amount,
                      category: nextRec.category,
                      methodId: nextRec.methodId ?? it.methodId,
                    }
                  : it,
              ),
            }));
            return {
              ...next,
              recurring: p.recurring.map((x) => (x.id === id ? nextRec : x)),
              recurringMemory: rememberRecurring(p.recurringMemory, {
                name: nextRec.name,
                amount: nextRec.amount,
                category: nextRec.category,
              }),
              transactions: next.transactions.map((t) =>
                t.recurringExpenseId === id && t.date.startsWith(month)
                  ? {
                      ...t,
                      name: nextRec.name,
                      amount: nextRec.amount,
                      category: nextRec.category,
                      type: categoryToType(nextRec.category),
                      methodId: nextRec.methodId ?? t.methodId,
                    }
                  : t,
              ),
            };
          }),
        );
      },
      removeRecurring: (id) =>
        set(
          withActive(get(), (p) => ({
            ...p,
            recurring: p.recurring.filter((x) => x.id !== id),
          })),
        ),
      toggleRecurring: (id, active) => {
        const s = get();
        set(
          withActive(s, (p) => {
            const next = {
              ...p,
              recurring: p.recurring.map((x) => (x.id === id ? { ...x, active } : x)),
            };
            return active ? applyAutos(next, s.activeMonth, defaultDate(s.activeMonth)) : next;
          }),
        );
      },
      skipRecurring: (id) => {
        const s = get();
        set(
          withActive(s, (p) => ({
            ...p,
            recurring: p.recurring.map((x) =>
              x.id === id ? { ...x, skippedMonths: [...(x.skippedMonths ?? []), s.activeMonth] } : x,
            ),
            transactions: p.transactions.filter(
              (t) => !(t.recurringExpenseId === id && t.date.startsWith(s.activeMonth)),
            ),
            months: {
              ...p.months,
              [s.activeMonth]: {
                ...(p.months[s.activeMonth] ?? emptyMonth()),
                items: (p.months[s.activeMonth]?.items ?? []).filter((i) => i.sourceId !== id),
              },
            },
          })),
        );
      },
      logRecurring: (id) => {
        const s = get();
        set(withActive(s, (p) => applyAutos(p, s.activeMonth, defaultDate(s.activeMonth))));
        void id;
      },
      applyAutosForMonth: (monthKey) => {
        const s = get();
        const mk = monthKey ?? s.activeMonth;
        set(withActive(s, (p) => applyAutos(p, mk, defaultDate(mk))));
      },
      addInflow: (inf) => {
        const s = get();
        const extra: ExtraInflow = {
          ...inf,
          id: uid(),
          category: inf.category ?? "investing",
          startMonth: inf.startMonth || s.activeMonth,
          active: inf.active ?? true,
        };
        set(
          withActive(s, (p) =>
            applyAutos({ ...p, inflows: [...(p.inflows ?? []), extra] }, s.activeMonth, defaultDate(s.activeMonth)),
          ),
        );
      },
      updateInflow: (id, patch) => {
        const s = get();
        set(
          withActive(s, (p) => {
            const nextInf = (p.inflows ?? []).map((x) => (x.id === id ? { ...x, ...patch } : x));
            return {
              ...p,
              inflows: nextInf,
              transactions: p.transactions.map((t) =>
                t.inflowId === id && t.date.startsWith(s.activeMonth)
                  ? {
                      ...t,
                      name: patch.name ?? t.name,
                      amount: patch.amount ?? t.amount,
                      category: patch.category ?? t.category,
                    }
                  : t,
              ),
            };
          }),
        );
      },
      removeInflow: (id) => {
        const s = get();
        set(
          withActive(s, (p) => ({
            ...p,
            inflows: (p.inflows ?? []).filter((x) => x.id !== id),
            transactions: p.transactions.filter(
              (t) => !(t.inflowId === id && t.date.startsWith(s.activeMonth)),
            ),
          })),
        );
      },
      addTransaction: (tx) =>
        set(
          withActive(get(), (p) => {
            const existing = findMergeableTx(p.transactions, tx);
            if (existing) {
              const amount = roundMoney(existing.amount + tx.amount);
              const methodId = tx.methodId ?? existing.methodId;
              let months = p.months;
              if (existing.itemId) {
                const mk = existing.date.slice(0, 7);
                const m = months[mk];
                if (m) {
                  months = {
                    ...months,
                    [mk]: {
                      ...m,
                      items: m.items.map((it) =>
                        it.id === existing.itemId ? { ...it, amount, methodId } : it,
                      ),
                    },
                  };
                }
              }
              return {
                ...p,
                months,
                transactions: [
                  ...p.transactions,
                  { ...tx, id: uid(), methodId, itemId: existing.itemId },
                ],
              };
            }
            return { ...p, transactions: [...p.transactions, { ...tx, id: uid() }] };
          }),
        ),
      updateTransaction: (id, patch) =>
        set(
          withActive(get(), (p) => ({
            ...p,
            transactions: p.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)),
          })),
        ),
      deleteTransaction: (id) =>
        set(
          withActive(get(), (p) => {
            const tx = p.transactions.find((t) => t.id === id);
            let months = p.months;
            if (tx?.itemId) {
              const mk = tx.date.slice(0, 7);
              const m = months[mk];
              if (m) {
                months = { ...months, [mk]: { ...m, items: m.items.filter((i) => i.id !== tx.itemId) } };
              }
            }
            return { ...p, months, transactions: p.transactions.filter((t) => t.id !== id) };
          }),
        ),
      copyPreviousMonth: () => {
        const s = get();
        const prev = prevMonthKey(s.activeMonth);
        set(
          withActive(s, (p) => {
            const source = p.months[prev];
            if (!source) return p;
            const current = p.months[s.activeMonth] ?? emptyMonth();
            return {
              ...p,
              months: {
                ...p.months,
                [s.activeMonth]: {
                  income: source.income,
                  items: current.items,
                  goalContributions: current.goalContributions,
                },
              },
            };
          }),
        );
      },
      setAiTip: (aiTip, tipId) => set(withActive(get(), (p) => ({ ...p, aiTip, tipId }))),
      restoreSample: () => {
        const s = get();
        const sample = sampleProfile(
          s.profiles.find((p) => p.id === s.activeProfileId)?.name ?? "Main",
          s.activeMonth,
        );
        sample.id = s.activeProfileId;
        set({ profiles: s.profiles.map((p) => (p.id === s.activeProfileId ? sample : p)) });
      },
      resetProfile: () => {
        const s = get();
        const fresh = emptyProfile(s.profiles.find((p) => p.id === s.activeProfileId)?.name ?? "Main");
        fresh.id = s.activeProfileId;
        set({ profiles: s.profiles.map((p) => (p.id === s.activeProfileId ? fresh : p)) });
      },
      importProfiles: (profiles, extras) => {
        const normalized = profiles.map(normalizeProfile);
        set({
          profiles: normalized,
          activeProfileId: extras?.activeProfileId ?? normalized[0]?.id,
          ...(extras ?? {}),
        });
      },
    }),
    {
      name: "budgetwise-v1",
      skipHydration: true,
      storage: createBudgetWiseStorage(),
      version: 7,
      migrate: (persisted, fromVersion) => {
        const s = persisted as Partial<AppState>;
        const profiles = (s.profiles ?? []).map((p) => {
          const next = normalizeProfile(p);
          if (fromVersion < 3) next.adjustments = { ...ZERO_ADJ };
          return next;
        });
        return {
          ...s,
          profiles,
          setupComplete: s.setupComplete ?? true,
          hasUndoImport: s.hasUndoImport ?? false,
          cardOpen: s.cardOpen ?? {},
          smartTransactionCapture: s.smartTransactionCapture ?? false,
          tourComplete: s.tourComplete ?? true,
        } as AppState;
      },
      partialize: (s) => {
        const { hydrated: _h, ...rest } = s;
        void _h;
        return rest as AppState;
      },
    },
  ),
);

export function useProfile(): Profile {
  return useAppStore((s) => s.profiles.find((p) => p.id === s.activeProfileId) ?? s.profiles[0]);
}

export function useMonthData(): MonthData {
  const monthKey = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  return profile.months[monthKey] ?? emptyMonth();
}

import type { Lang } from "./i18n";
import type {
  CapturedPurchaseSuggestion,
  MerchantCategoryRule,
  WalletMethodMap,
} from "./capture/types";
import type { CurrencyCode } from "./money";
import type { CalcMode, FreqKey, Timing } from "./compound";
import type { PaydownMethod, Debt } from "./debt";

export type CategoryId = "essential" | "investing" | "flexible";
export type AllocKey = CategoryId | "savings" | "debt";
export type TxType = "income" | "expense" | "saving" | "investment" | "debt-payment";
export type TxCategory = CategoryId | "savings" | "debt" | "income";
export type ItemSource = "manual" | "recurring" | "large" | "debt";

export interface PaymentMethod {
  id: string;
  name: string;
  color: string;
  type?: "cash" | "bank" | "credit-card" | "debit-card" | "broker-card" | "other";
  archived?: boolean;
}

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
  category: CategoryId;
  methodId?: string;
  source?: ItemSource;
  sourceId?: string;
}

export interface Transaction {
  id: string;
  type: TxType;
  category: TxCategory;
  name: string;
  amount: number;
  date: string;
  notes?: string;
  methodId?: string;
  itemId?: string;
  goalId?: string;
  debtId?: string;
  largePurchaseId?: string;
  recurringExpenseId?: string;
  inflowId?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  current: number;
}

export type RecurringFreq = "monthly" | "bimonthly" | "quarterly" | "semiannual" | "yearly";

export interface LargePurchase {
  id: string;
  name: string;
  total: number;
  months: number;
  startMonth: string;
  category: AllocKey;
  paidMonths?: number;
  skippedMonths?: string[];
  fundFromGoalId?: string;
  methodId?: string;
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  category: CategoryId;
  methodId?: string;
  frequency?: RecurringFreq;
  startMonth?: string;
  nextDueDate?: string;
  active?: boolean;
  skippedMonths?: string[];
}

export interface ExtraInflow {
  id: string;
  name: string;
  amount: number;
  category: AllocKey;
  recurring: boolean;
  frequency?: RecurringFreq;
  startMonth: string;
  active?: boolean;
  skippedMonths?: string[];
}

export interface RecurringMemory {
  name: string;
  amount: number;
  category: CategoryId;
}

export interface MonthData {
  income: number;
  items: BudgetItem[];
  goalContributions: Record<string, number>;
}

export interface Profile {
  id: string;
  name: string;
  paymentMethods: PaymentMethod[];
  months: Record<string, MonthData>;
  goals: SavingsGoal[];
  debts: Debt[];
  largePurchases: LargePurchase[];
  recurring: RecurringExpense[];
  recurringMemory: RecurringMemory[];
  inflows: ExtraInflow[];
  transactions: Transaction[];
  assets: {
    cash: number;
    bank: number;
    savings: number;
    investments: number;
    property: number;
    other: number;
  };
  percents: Record<AllocKey, number>;
  adjustments: Record<AllocKey, number>;
  debtMethod: PaydownMethod;
  extraDebtPayment: number;
  aiTip: string;
  tipId?: string;
  captureSuggestions?: CapturedPurchaseSuggestion[];
  merchantCategoryRules?: MerchantCategoryRule[];
  walletMethodMaps?: WalletMethodMap[];
}

export interface CalcDraft {
  mode: CalcMode;
  goal: number;
  principal: number;
  pmt: number;
  annualRatePct: number;
  years: number;
  freq: FreqKey;
  timing: Timing;
}

export type { Lang, CurrencyCode, Debt, PaydownMethod };
export type { CapturedPurchaseSuggestion, MerchantCategoryRule, WalletMethodMap };

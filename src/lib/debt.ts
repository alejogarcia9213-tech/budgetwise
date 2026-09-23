export interface Debt {
  id: string;
  name: string;
  balance: number;
  ratePct: number;
  minPayment: number;
  category?: "essential" | "investing" | "flexible" | "savings" | "debt";
  skippedMonths?: string[];
  methodId?: string;
}

export interface PaydownMonth {
  month: number;
  label: string;
  payments: { id: string; name: string; payment: number; interest: number; balance: number }[];
  extraTo: string | null;
  totalPaid: number;
  totalInterest: number;
  remaining: number;
}

export interface PaydownPlan {
  months: number;
  totalInterest: number;
  totalPaid: number;
  schedule: PaydownMonth[];
  debtFree: boolean;
  originalTotal: number;
  minOnlyInterest: number;
  interestSaved: number;
}

export type PaydownMethod = "avalanche" | "snowball";

interface WorkingDebt {
  id: string;
  name: string;
  balance: number;
  ratePct: number;
  minPayment: number;
}

function sortDebts(working: WorkingDebt[], method: PaydownMethod) {
  working.sort((a, b) => {
    if (method === "avalanche") {
      return b.ratePct - a.ratePct || a.balance - b.balance || a.id.localeCompare(b.id);
    }
    return a.balance - b.balance || a.ratePct - b.ratePct || a.id.localeCompare(b.id);
  });
}

function simulate(
  debts: Debt[],
  extraMonthly: number,
  method: PaydownMethod,
  cascadeFreedMins: boolean,
  maxMonths: number,
): Omit<PaydownPlan, "minOnlyInterest" | "interestSaved"> {
  const originalTotal = debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
  const working: WorkingDebt[] = debts
    .filter((d) => d.balance > 0.005)
    .map((d) => ({ ...d, balance: d.balance }));

  if (working.length === 0) {
    return {
      months: 0,
      totalInterest: 0,
      totalPaid: 0,
      schedule: [],
      debtFree: true,
      originalTotal: 0,
    };
  }

  const originalMinSum = working.reduce((s, d) => s + Math.max(0, d.minPayment), 0);
  const schedule: PaydownMonth[] = [];
  let totalInterest = 0;
  let totalPaid = 0;

  for (let m = 1; m <= maxMonths; m++) {
    let monthInterest = 0;
    let monthPaid = 0;
    for (const d of working) {
      if (d.balance <= 0.005) continue;
      const monthlyRate = d.ratePct / 100 / 12;
      const interest = d.balance * monthlyRate;
      d.balance += interest;
      monthInterest += interest;
      totalInterest += interest;
    }

    sortDebts(working, method);
    const alive = working.filter((d) => d.balance > 0.005);
    const focus = alive[0] ?? null;
    const payments: PaydownMonth["payments"] = [];

    const remainingMins = working.reduce((s, d) => s + (d.balance > 0.005 ? Math.max(0, d.minPayment) : 0), 0);
    let pool = Math.max(0, extraMonthly) + (cascadeFreedMins ? originalMinSum : remainingMins);

    for (const d of working) {
      if (d.balance <= 0.005) continue;
      const isFocus = focus && d.id === focus.id;
      if (isFocus) continue;
      const pay = Math.min(d.minPayment, d.balance);
      d.balance -= pay;
      if (d.balance < 0.005) d.balance = 0;
      pool -= pay;
      monthPaid += pay;
      totalPaid += pay;
      payments.push({ id: d.id, name: d.name, payment: pay, interest: 0, balance: d.balance });
    }

    if (focus && focus.balance > 0.005) {
      const pay = Math.min(Math.max(pool, 0), focus.balance);
      focus.balance -= pay;
      if (focus.balance < 0.005) focus.balance = 0;
      monthPaid += pay;
      totalPaid += pay;
      payments.push({
        id: focus.id,
        name: focus.name,
        payment: pay,
        interest: 0,
        balance: focus.balance,
      });
    }

    const remaining = working.reduce((s, d) => s + d.balance, 0);
    schedule.push({
      month: m,
      label: `M${m}`,
      payments,
      extraTo: focus?.name ?? null,
      totalPaid: monthPaid,
      totalInterest: monthInterest,
      remaining,
    });

    if (remaining <= 0.05) {
      return {
        months: m,
        totalInterest,
        totalPaid,
        schedule,
        debtFree: true,
        originalTotal,
      };
    }

    if (m > 12 && monthPaid + 0.01 < monthInterest && extraMonthly + remainingMins <= monthInterest) {
      break;
    }
  }

  return {
    months: schedule.length,
    totalInterest,
    totalPaid,
    schedule,
    debtFree: working.every((d) => d.balance <= 0.05),
    originalTotal,
  };
}

export function planPaydown(
  debts: Debt[],
  extraMonthly: number,
  method: PaydownMethod,
  maxMonths = 360,
): PaydownPlan {
  const planned = simulate(debts, extraMonthly, method, true, maxMonths);
  const minOnly = simulate(debts, 0, method, false, maxMonths);
  const interestSaved = Math.max(0, minOnly.totalInterest - planned.totalInterest);
  return {
    ...planned,
    minOnlyInterest: minOnly.totalInterest,
    interestSaved,
  };
}

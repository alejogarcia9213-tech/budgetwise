export type CalcMode = "save" | "time" | "pmt" | "rate";
export type Timing = "begin" | "end";
export type FreqKey = "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";

export const FREQ: Record<FreqKey, { perYear: number; es: string; en: string; shortEs: string; shortEn: string }> =
  {
    weekly: { perYear: 52, es: "Semanalmente (52/Año)", en: "Weekly (52/Year)", shortEs: "Semanal", shortEn: "Weekly" },
    biweekly: {
      perYear: 26,
      es: "Quincenalmente (26/Año)",
      en: "Biweekly (26/Year)",
      shortEs: "Quincenal",
      shortEn: "Biweekly",
    },
    monthly: {
      perYear: 12,
      es: "Mensualmente (12/Año)",
      en: "Monthly (12/Year)",
      shortEs: "Mensual",
      shortEn: "Monthly",
    },
    quarterly: {
      perYear: 4,
      es: "Trimestralmente (4/Año)",
      en: "Quarterly (4/Year)",
      shortEs: "Trimestral",
      shortEn: "Quarterly",
    },
    annually: { perYear: 1, es: "Anualmente (1/Año)", en: "Annually (1/Year)", shortEs: "Anual", shortEn: "Annual" },
  };

export const FREQ_KEYS = Object.keys(FREQ) as FreqKey[];

export interface YearRow {
  year: number;
  periodDeposits: number;
  totalDeposits: number;
  totalInterest: number;
  balance: number;
}

export interface SimulateInput {
  principal: number;
  pmt: number;
  annualRatePct: number;
  years: number;
  periodsPerYear: number;
  timing: Timing;
}

export function simulate(input: SimulateInput): YearRow[] {
  const { principal, pmt, timing } = input;
  const periodsPerYear = Math.max(1, input.periodsPerYear);
  const totalPeriods = Math.max(0, Math.round(input.years * periodsPerYear));
  const i = input.annualRatePct / 100 / periodsPerYear;
  let balance = principal;
  let totalDeposits = principal;
  let totalInterest = 0;
  const rows: YearRow[] = [];
  let yearDeposits = 0;

  if (totalPeriods === 0) {
    return [
      {
        year: 0,
        periodDeposits: 0,
        totalDeposits: principal,
        totalInterest: 0,
        balance: principal,
      },
    ];
  }

  for (let p = 1; p <= totalPeriods; p++) {
    if (timing === "begin") {
      balance += pmt;
      totalDeposits += pmt;
      yearDeposits += pmt;
    }
    const interest = balance * i;
    balance += interest;
    totalInterest += interest;
    if (timing === "end") {
      balance += pmt;
      totalDeposits += pmt;
      yearDeposits += pmt;
    }
    if (p % periodsPerYear === 0 || p === totalPeriods) {
      rows.push({
        year: Math.ceil(p / periodsPerYear),
        periodDeposits: yearDeposits,
        totalDeposits,
        totalInterest,
        balance,
      });
      yearDeposits = 0;
    }
  }
  return rows;
}

export function futureValue(input: SimulateInput): number {
  const rows = simulate(input);
  return rows[rows.length - 1]?.balance ?? input.principal;
}

function pow1p(i: number, n: number) {
  return (1 + i) ** n;
}

/** Closed-form PMT so FV equals the goal. */
export function solvePmt(input: Omit<SimulateInput, "pmt"> & { goal: number }): number {
  const { principal, goal, timing, years } = input;
  const m = Math.max(1, input.periodsPerYear);
  const n = Math.round(years * m);
  const i = input.annualRatePct / 100 / m;
  const fvLump = principal * pow1p(i, n);
  const remaining = goal - fvLump;
  if (n <= 0) return 0;
  if (Math.abs(i) < 1e-12) return remaining / n;
  const factor = (pow1p(i, n) - 1) / i;
  const due = timing === "begin" ? 1 + i : 1;
  if (factor * due === 0) return 0;
  return remaining / (factor * due);
}

export function solveTime(
  input: Omit<SimulateInput, "years"> & { goal: number },
): { years: number; periods: number; reachable: boolean } {
  const { principal, pmt, goal, timing } = input;
  const m = Math.max(1, input.periodsPerYear);
  const i = input.annualRatePct / 100 / m;
  if (principal >= goal) return { years: 0, periods: 0, reachable: true };

  const maxPeriods = m * 120;
  let balance = principal;
  for (let p = 1; p <= maxPeriods; p++) {
    if (timing === "begin") balance += pmt;
    balance += balance * i;
    if (timing === "end") balance += pmt;
    if (balance >= goal) {
      return { years: p / m, periods: p, reachable: true };
    }
    if (pmt <= 0 && i <= 0) break;
  }
  return { years: Infinity, periods: maxPeriods, reachable: false };
}

export function solveRate(
  input: Omit<SimulateInput, "annualRatePct"> & { goal: number },
): number {
  const { principal, pmt, goal, years, timing, periodsPerYear } = input;
  const atZero = futureValue({ ...input, annualRatePct: 0 });
  if (atZero >= goal - 0.005) return 0;
  if (goal <= 0) return 0;

  let lo = 0;
  let hi = 100;
  for (let k = 0; k < 12; k++) {
    if (futureValue({ ...input, annualRatePct: hi }) >= goal) break;
    hi *= 2;
    if (hi > 1e6) return NaN;
  }
  if (futureValue({ ...input, annualRatePct: hi }) < goal) return NaN;

  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2;
    const fv = futureValue({ principal, pmt, annualRatePct: mid, years, periodsPerYear, timing });
    if (fv >= goal) hi = mid;
    else lo = mid;
  }
  return hi;
}

export interface CalcInput {
  mode: CalcMode;
  goal: number;
  principal: number;
  pmt: number;
  annualRatePct: number;
  years: number;
  freq: FreqKey;
  timing: Timing;
}

export interface CalcResult {
  ok: true;
  mode: CalcMode;
  finalBalance: number;
  totalDeposits: number;
  totalPeriodic: number;
  totalInterest: number;
  principal: number;
  pmt: number;
  annualRatePct: number;
  years: number;
  yearsNeeded?: number;
  monthsRemainder?: number;
  pmtNeeded?: number;
  rateNeeded?: number;
  reachable: boolean;
  alreadyThere: boolean;
  rows: YearRow[];
  freq: FreqKey;
  timing: Timing;
}

export interface CalcError {
  ok: false;
  error: "unreachable" | "invalid";
}

export function calculate(input: CalcInput): CalcResult | CalcError {
  const periodsPerYear = FREQ[input.freq].perYear;
  const principal = Math.max(0, input.principal);
  const goal = Math.max(0, input.goal);
  let pmt = input.pmt;
  let annualRatePct = input.annualRatePct;
  let years = Math.max(0, input.years);
  const timing = input.timing;

  if (input.mode === "pmt") {
    pmt = solvePmt({ principal, goal, annualRatePct, years, periodsPerYear, timing });
    if (!Number.isFinite(pmt)) return { ok: false, error: "invalid" };
  }

  if (input.mode === "rate") {
    annualRatePct = solveRate({ principal, pmt, goal, years, periodsPerYear, timing });
    if (!Number.isFinite(annualRatePct)) return { ok: false, error: "unreachable" };
  }

  if (input.mode === "time") {
    const t = solveTime({ principal, pmt, goal, annualRatePct, periodsPerYear, timing });
    if (!t.reachable) return { ok: false, error: "unreachable" };
    years = t.years;
  }

  const simYears = input.mode === "time" ? Math.max(years, 1 / periodsPerYear) : Math.max(years, 0);
  const rows = simulate({
    principal,
    pmt,
    annualRatePct,
    years: simYears,
    periodsPerYear,
    timing,
  });
  const last = rows[rows.length - 1];
  const finalBalance = last?.balance ?? principal;
  const totalDeposits = last?.totalDeposits ?? principal;
  const totalInterest = last?.totalInterest ?? 0;
  const totalPeriodic = Math.max(0, totalDeposits - principal);

  const wholeYears = Math.floor(years);
  const monthsRemainder = Math.round((years - wholeYears) * 12);

  return {
    ok: true,
    mode: input.mode,
    finalBalance,
    totalDeposits,
    totalPeriodic,
    totalInterest,
    principal,
    pmt,
    annualRatePct,
    years,
    yearsNeeded: input.mode === "time" ? years : undefined,
    monthsRemainder: input.mode === "time" ? monthsRemainder : undefined,
    pmtNeeded: input.mode === "pmt" ? pmt : undefined,
    rateNeeded: input.mode === "rate" ? annualRatePct : undefined,
    reachable: true,
    alreadyThere: principal >= goal && (input.mode === "time" || input.mode === "rate" || input.mode === "pmt"),
    rows,
    freq: input.freq,
    timing,
  };
}

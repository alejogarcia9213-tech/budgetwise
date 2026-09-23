export interface TipSnapshot {
  netIncome: number;
  essentialExpenses: number;
  flexibleExpenses: number;
  savings: number;
  investments: number;
  debts: number;
  netWorth: number;
  liquidityMonths: number;
  savingsInvestmentRate: number;
  leftToBudget: number;
  leftover: number;
}

export interface Tip {
  id: string;
  en: string;
  es: string;
}

const TIPS: { id: string; when: (s: TipSnapshot) => boolean; en: string; es: string }[] = [
  {
    id: "emergency",
    when: (s) => s.liquidityMonths < 3,
    en: "Your cash buffer covers less than three months of essentials. Park the next leftover euro in an emergency fund before adding new lifestyle spend.",
    es: "Tu colchón cubre menos de tres meses de gastos esenciales. Destina el siguiente euro libre al fondo de emergencia antes de aumentar el ocio.",
  },
  {
    id: "over-allocate",
    when: (s) => s.leftToBudget < -1,
    en: "Planned allocations exceed this month's income. Lower a target percentage or trim an adjustment so every euro has a job without going over.",
    es: "Las asignaciones previstas superan los ingresos del mes. Baja un porcentaje o un ajuste para que cada euro tenga un propósito sin pasarte.",
  },
  {
    id: "unallocated",
    when: (s) => s.leftToBudget > 20,
    en: "You still have money left to budget. Give it a job — debt extra, emergency fund, or the investment line — so it does not leak into impulse spend.",
    es: "Todavía te queda dinero por asignar. Dale un propósito: extra a deuda, fondo de emergencia o inversión, para que no se escape en impulsos.",
  },
  {
    id: "high-essentials",
    when: (s) => s.netIncome > 0 && s.essentialExpenses / s.netIncome > 0.7,
    en: "Essentials are taking more than 70% of income. Look for a recurring cut in rent, utilities or groceries — that is the fastest way to free savings.",
    es: "Lo esencial se lleva más del 70% de los ingresos. Revisa alquiler, suministros y comida para un recorte recurrente: es la vía más rápida para liberar ahorro.",
  },
  {
    id: "leftover-cash",
    when: (s) => s.leftover > 50 && s.savings === 0,
    en: "The month still shows a cash surplus with no savings contribution. Sweep that leftover into your emergency fund before the next payday.",
    es: "El mes cierra con superávit y sin aportación a ahorro. Pasa ese resto al fondo de emergencia antes de la siguiente nómina.",
  },
  {
    id: "on-track",
    when: () => true,
    en: "Keep recording every spend the day it happens. The budget is only as honest as the ledger — two minutes now prevents a surprise at month-end.",
    es: "Sigue anotando cada gasto el día que ocurre. El presupuesto solo es honesto si el libro lo es: dos minutos ahora evitan sorpresas a fin de mes.",
  },
];

export function generateFinancialTips(snapshot: TipSnapshot, excludeId?: string): Tip[] {
  return TIPS.filter((tip) => tip.id !== excludeId && tip.when(snapshot)).map(({ id, en, es }) => ({
    id,
    en,
    es,
  }));
}

export function pickTip(snapshot: TipSnapshot, excludeId?: string): Tip {
  const applicable = generateFinancialTips(snapshot, excludeId);
  const pool = applicable.length > 0 ? applicable : generateFinancialTips(snapshot);
  return pool[Math.floor(Math.random() * pool.length)] ?? {
    id: "on-track",
    en: TIPS[TIPS.length - 1]!.en,
    es: TIPS[TIPS.length - 1]!.es,
  };
}

export function answerBudgetQuestion(question: string, s: TipSnapshot, lang: string): string {
  const q = question.toLowerCase();
  const leftover = s.leftover;
  const left = s.leftToBudget;
  if (/leftover|sobra|resta|übrig|surplus|left to budget|asignar/.test(q)) {
    if (lang === "es") {
      return leftover >= 0
        ? `Este mes te quedan ${leftover.toFixed(2)} después de gastos. Aún hay ${left.toFixed(2)} por asignar a un sobre.`
        : `Este mes vas ${Math.abs(leftover).toFixed(2)} por encima de los ingresos. Recorta esenciales u ocio.`;
    }
    return leftover >= 0
      ? `You have ${leftover.toFixed(2)} left after this month's recorded spend. ${left.toFixed(2)} is still unassigned to an envelope.`
      : `You are ${Math.abs(leftover).toFixed(2)} over income this month. Trim essentials or fun before adding more.`;
  }
  if (/debt|deuda|schulden/.test(q)) {
    if (lang === "es") {
      return s.debts > 0
        ? `Debes ${s.debts.toFixed(2)}. Cualquier sobrante (${Math.max(0, leftover).toFixed(2)}) acelera la deuda extra.`
        : `No hay deudas registradas.`;
    }
    return s.debts > 0
      ? `Recorded debt is ${s.debts.toFixed(2)}. Any leftover (${Math.max(0, leftover).toFixed(2)}) can go to an extra payment.`
      : `No debts are on the books.`;
  }
  if (/invest|invert|sparen|save|ahorr/.test(q)) {
    if (lang === "es") {
      return `Este mes: ahorro ${s.savings.toFixed(2)}, inversión ${s.investments.toFixed(2)}. Ingresos ${s.netIncome.toFixed(2)}.`;
    }
    return `This month: saved ${s.savings.toFixed(2)}, invested ${s.investments.toFixed(2)}, income ${s.netIncome.toFixed(2)}.`;
  }
  if (lang === "es") {
    return `Ingresos ${s.netIncome.toFixed(2)}. Esenciales ${s.essentialExpenses.toFixed(2)}, ocio ${s.flexibleExpenses.toFixed(2)}, invertido ${s.investments.toFixed(2)}. Sobrante ${leftover.toFixed(2)}.`;
  }
  return `Income ${s.netIncome.toFixed(2)}. Essentials ${s.essentialExpenses.toFixed(2)}, fun ${s.flexibleExpenses.toFixed(2)}, invested ${s.investments.toFixed(2)}. Leftover ${leftover.toFixed(2)}.`;
}

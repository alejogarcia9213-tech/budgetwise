export interface RatioResult {
  key: string;
  value: number;
  display: string;
  healthy: boolean;
  unit: "months" | "pct";
}

export interface HealthInput {
  cash: number;
  bank: number;
  savings: number;
  investments: number;
  property: number;
  other: number;
  debts: { balance: number; minPayment: number }[];
  monthlyEssentials: number;
  monthlyIncome: number;
  monthlySaved: number;
  monthlyInvested: number;
}

export interface HealthReport {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquid: number;
  ratios: RatioResult[];
}

export function computeHealth(input: HealthInput): HealthReport {
  const totalAssets =
    input.cash + input.bank + input.savings + input.investments + input.property + input.other;
  const totalLiabilities = input.debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
  const netWorth = totalAssets - totalLiabilities;
  const liquid = input.cash + input.bank + input.savings;
  const minDebtPay = input.debts.reduce((s, d) => s + Math.max(0, d.minPayment), 0);

  const liquidity = input.monthlyEssentials > 0 ? liquid / input.monthlyEssentials : liquid > 0 ? 99 : 0;
  const savInv =
    input.monthlyIncome > 0 ? ((input.monthlySaved + input.monthlyInvested) / input.monthlyIncome) * 100 : 0;
  const debtToAssets = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : totalLiabilities > 0 ? 100 : 0;
  const monthlyDebt = input.monthlyIncome > 0 ? (minDebtPay / input.monthlyIncome) * 100 : 0;
  const investedNw = netWorth > 0 ? (input.investments / netWorth) * 100 : 0;
  const solvency = totalAssets > 0 ? (netWorth / totalAssets) * 100 : 0;

  const ratios: RatioResult[] = [
    { key: "liquidity", value: liquidity, display: liquidity.toFixed(2), healthy: liquidity >= 3, unit: "months" },
    { key: "savInvRate", value: savInv, display: savInv.toFixed(2), healthy: savInv >= 20, unit: "pct" },
    { key: "debtToAssets", value: debtToAssets, display: debtToAssets.toFixed(2), healthy: debtToAssets <= 40, unit: "pct" },
    { key: "monthlyDebt", value: monthlyDebt, display: monthlyDebt.toFixed(2), healthy: monthlyDebt <= 36, unit: "pct" },
    { key: "investedNw", value: investedNw, display: investedNw.toFixed(2), healthy: investedNw >= 50, unit: "pct" },
    { key: "solvency", value: solvency, display: solvency.toFixed(2), healthy: solvency >= 50, unit: "pct" },
  ];

  return { totalAssets, totalLiabilities, netWorth, liquid, ratios };
}

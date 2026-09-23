import { INTL_LOCALE, type Lang } from "./i18n";

export const CURRENCIES = [
  { code: "EUR", label: "EUR (€)", symbol: "€" },
  { code: "USD", label: "USD ($)", symbol: "$" },
  { code: "GBP", label: "GBP (£)", symbol: "£" },
  { code: "MXN", label: "MXN ($)", symbol: "$" },
  { code: "COP", label: "COP ($)", symbol: "$" },
  { code: "ARS", label: "ARS ($)", symbol: "$" },
  { code: "BRL", label: "BRL (R$)", symbol: "R$" },
  { code: "CHF", label: "CHF (Fr)", symbol: "Fr" },
  { code: "AUD", label: "AUD ($)", symbol: "$" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export function currencySymbol(code: string) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function roundMoney(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function localeOf(lang: Lang | string) {
  return INTL_LOCALE[lang as Lang] ?? "en-US";
}

export function formatMoney(
  amount: number,
  currency: string,
  lang: Lang | string,
  opts?: { compact?: boolean },
) {
  const n = roundMoney(amount);
  try {
    return new Intl.NumberFormat(localeOf(lang), {
      style: "currency",
      currency,
      minimumFractionDigits: opts?.compact ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

export function formatPct(value: number, lang: Lang | string, digits = 2) {
  return `${new Intl.NumberFormat(localeOf(lang), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)}%`;
}

export function formatNumber(value: number, lang: Lang | string, digits = 2) {
  return new Intl.NumberFormat(localeOf(lang), {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function parseAmount(raw: string): number {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

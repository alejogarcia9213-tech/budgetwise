import type { Lang } from "./i18n";
import { isLang } from "./i18n";
import type { CurrencyCode } from "./money";

const REGION_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD",
  PR: "USD",
  GU: "USD",
  GB: "GBP",
  UK: "GBP",
  MX: "MXN",
  CO: "COP",
  AR: "ARS",
  BR: "BRL",
  CH: "CHF",
  AU: "AUD",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  PT: "EUR",
  NL: "EUR",
  AT: "EUR",
  IE: "EUR",
  BE: "EUR",
  FI: "EUR",
  GR: "EUR",
  LU: "EUR",
  SK: "EUR",
  SI: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  CY: "EUR",
  MT: "EUR",
};

const TZ_CURRENCY: Record<string, CurrencyCode> = {
  "America/New_York": "USD",
  "America/Chicago": "USD",
  "America/Denver": "USD",
  "America/Los_Angeles": "USD",
  "America/Bogota": "COP",
  "America/Mexico_City": "MXN",
  "America/Argentina/Buenos_Aires": "ARS",
  "America/Sao_Paulo": "BRL",
  "Europe/London": "GBP",
  "Europe/Berlin": "EUR",
  "Europe/Paris": "EUR",
  "Europe/Rome": "EUR",
  "Europe/Madrid": "EUR",
  "Europe/Lisbon": "EUR",
  "Europe/Zurich": "CHF",
  "Australia/Sydney": "AUD",
  "Australia/Melbourne": "AUD",
};

export function langFromLocale(tag: string): Lang {
  const base = tag.toLowerCase().replace("_", "-").split("-")[0] ?? "en";
  return isLang(base) ? base : "en";
}

export function currencyFromLocale(tag: string, timeZone?: string): CurrencyCode {
  const parts = tag.replace("_", "-").split("-");
  const region = (parts[1] ?? "").toUpperCase();
  if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region]!;
  const tz = timeZone ?? "";
  if (tz && TZ_CURRENCY[tz]) return TZ_CURRENCY[tz]!;
  const lang = langFromLocale(tag);
  if (lang === "pt") return "BRL";
  if (lang === "es") return "MXN";
  if (lang === "de" || lang === "fr" || lang === "it") return "EUR";
  return "EUR";
}

export function detectVisitorLocale(input?: { languages?: readonly string[]; timeZone?: string }) {
  const languages = input?.languages ?? (typeof navigator !== "undefined" ? navigator.languages : ["en"]);
  const timeZone =
    input?.timeZone ??
    (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "");
  const tag = languages[0] || "en";
  return {
    lang: langFromLocale(tag),
    currency: currencyFromLocale(tag, timeZone),
    tag,
  };
}

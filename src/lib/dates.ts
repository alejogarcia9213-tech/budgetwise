import { addMonths, format, parse } from "date-fns";
import { de, enUS, es, fr, it, ptBR } from "date-fns/locale";
import type { Lang } from "./i18n";

const DATE_FNS = { en: enUS, es, de, it, fr, pt: ptBR } as const;

function localeOf(lang: Lang) {
  return DATE_FNS[lang] ?? enUS;
}

export function currentMonthKey(d = new Date()) {
  return format(d, "yyyy-MM");
}

export function parseMonthKey(key: string) {
  return parse(`${key}-01`, "yyyy-MM-dd", new Date());
}

export function shiftMonth(key: string, delta: number) {
  return format(addMonths(parseMonthKey(key), delta), "yyyy-MM");
}

export function nextMonthKey(key: string) {
  return shiftMonth(key, 1);
}

export function prevMonthKey(key: string) {
  return shiftMonth(key, -1);
}

export function monthTitle(key: string, lang: Lang) {
  const raw = format(parseMonthKey(key), "MMMM yyyy", { locale: localeOf(lang) });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function monthShort(key: string, lang: Lang) {
  const raw = format(parseMonthKey(key), "MMM", { locale: localeOf(lang) });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function yearOf(key: string) {
  return key.slice(0, 4);
}

export function isoToday() {
  return format(new Date(), "yyyy-MM-dd");
}

export function dateInMonth(monthKey: string, day = 1) {
  const dim = daysInMonth(monthKey);
  const d = Math.max(1, Math.min(day, dim));
  return `${monthKey}-${String(d).padStart(2, "0")}`;
}

export function daysInMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function startWeekday(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).getDay();
}

export function formatDayTitle(iso: string, lang: Lang) {
  const d = parse(iso, "yyyy-MM-dd", new Date());
  const raw = format(d, "d MMMM yyyy", { locale: localeOf(lang) });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function monthIndex(key: string) {
  const [y, m] = key.split("-").map(Number);
  return y * 12 + (m - 1);
}

export function monthsBetween(startKey: string, currentKey: string) {
  return monthIndex(currentKey) - monthIndex(startKey);
}

export function monthNames(lang: Lang) {
  return Array.from({ length: 12 }, (_, i) => {
    const raw = format(new Date(2020, i, 1), "MMM", { locale: localeOf(lang) });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });
}

export function monthKeyFromParts(year: number, month1to12: number) {
  return `${year}-${String(month1to12).padStart(2, "0")}`;
}


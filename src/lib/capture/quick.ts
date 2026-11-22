import type { CategoryId } from "@/lib/types";

/**
 * Parses amounts the way people actually type them or the way a phone
 * hands them over: "23,90", "€23.90", "$45.000", "45.000 COP", "1,234.50", "12".
 */
export function parseLooseAmount(raw: string | null | undefined, currency = "EUR"): number | null {
  if (raw == null) return null;
  let s = String(raw)
    .replace(/[€$£¥]|[A-Za-z]{2,4}\$?/g, " ")
    .replace(/\s+/g, "")
    .trim();
  s = s.replace(/[^\d.,-]/g, "");
  if (!s || !/\d/.test(s)) return null;
  const noCents = currency === "COP" || currency === "CLP" || currency === "JPY";

  const lastDot = s.lastIndexOf(".");
  const lastComma = s.lastIndexOf(",");
  let n: number;
  if (lastDot >= 0 && lastComma >= 0) {
    // Both present: the right-most one is the decimal separator.
    const dec = lastDot > lastComma ? "." : ",";
    const thou = dec === "." ? "," : ".";
    n = Number(s.split(thou).join("").replace(dec, "."));
  } else if (lastDot >= 0 || lastComma >= 0) {
    const sep = lastDot >= 0 ? "." : ",";
    const parts = s.split(sep);
    const tail = parts[parts.length - 1] ?? "";
    const looksThousands = parts.length > 2 || (tail.length === 3 && (noCents || parts[0] !== "0"));
    n = looksThousands ? Number(parts.join("")) : Number(parts.join("").slice(0, -tail.length) + "." + tail);
  } else {
    n = Number(s);
  }
  if (!Number.isFinite(n) || n <= 0 || n > 50_000_000) return null;
  return Math.round(Math.abs(n) * 100) / 100;
}

const FLEX =
  /\b(netflix|spotify|disney|uber|rappi|didi|lieferando|doordash|starbucks|caf[eé]|coffee|kaffee|bar|pub|cine|cinema|kino|restaurant|restaurante|pizza|burger|mcdonald|kfc|zara|primark|amazon|steam|playstation|nintendo|helado|ice cream|bakery|panader[ií]a)\b/i;
const INVEST = /\b(etoro|trade republic|vanguard|blackrock|scalable|degiro|coinbase|binance|ishares|etf|broker|bitcoin)\b/i;
const ESSENTIAL =
  /\b(rewe|lidl|aldi|edeka|kaufland|penny|netto|dm|rossmann|[eé]xito|carulla|d1|ara|ol[ií]mpica|jumbo|mercado|supermarket|supermercado|farmacia|apotheke|pharmacy|gas|gasolina|tankstelle|shell|aral|esso|terpel|metro|bus|bahn|db|transmilenio|arriendo|rent|miete|luz|agua|internet|strom)\b/i;

export function guessCategory(
  name: string,
  rules: { merchant: string; categoryId: CategoryId }[] = [],
  items: { name: string; category: CategoryId }[] = [],
): { category: CategoryId; confidence: number } {
  const low = name.toLowerCase().trim();
  const rule = rules.find((r) => r.merchant.toLowerCase() === low);
  if (rule) return { category: rule.categoryId, confidence: 0.95 };
  const hit = items.find((it) => {
    const n = it.name.toLowerCase();
    return n && low && (n.includes(low) || low.includes(n));
  });
  if (hit) return { category: hit.category, confidence: 0.75 };
  if (INVEST.test(name)) return { category: "investing", confidence: 0.6 };
  if (ESSENTIAL.test(name)) return { category: "essential", confidence: 0.6 };
  if (FLEX.test(name)) return { category: "flexible", confidence: 0.6 };
  return { category: "flexible", confidence: 0.2 };
}

/**
 * One-line entry: "12,50 café", "Rewe 23.90", "45.000 mercado #fijo".
 * Tags: #fijo/#esencial/#essential → essential, #inv/#invest → investing, #ocio/#fun → flexible.
 */
export function parseQuickText(text: string, currency = "EUR") {
  const raw = text.trim();
  if (!raw) return null;
  let forced: CategoryId | null = null;
  if (/#(fijo|esencial|essential|basic|fix)\b/i.test(raw)) forced = "essential";
  if (/#(inv|invest|inversi[oó]n|investing)\b/i.test(raw)) forced = "investing";
  if (/#(ocio|fun|flex|gusto|spass)\b/i.test(raw)) forced = "flexible";
  const clean = raw.replace(/#\S+/g, " ").replace(/\s+/g, " ").trim();
  const m = clean.match(/[€$£]?\s?\d[\d.,]*\s?(?:€|eur|usd|cop|mxn|\$)?/i);
  if (!m) return null;
  const amount = parseLooseAmount(m[0], currency);
  if (amount == null) return null;
  const name = (clean.slice(0, m.index) + " " + clean.slice((m.index ?? 0) + m[0].length))
    .replace(/\s+/g, " ")
    .replace(/^[-–:,\s]+|[-–:,\s]+$/g, "")
    .trim();
  return { amount, name: name ? name.replace(/^\p{Ll}/u, (c) => c.toUpperCase()) : "", forced };
}

/** Text shared from a bank SMS / notification / screenshot caption. */
export function parseSharedText(text: string, currency = "EUR") {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const joined = lines.join(" ");
  const money = joined.match(/(?:[€$£]\s?\d[\d.,]*|\d[\d.,]*\s?(?:€|eur|usd|cop|mxn|pesos))/i) ?? joined.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?/);
  const amount = money ? parseLooseAmount(money[0], currency) : null;
  const at = joined.match(/\b(?:en|at|bei|in|a)\s+([A-Z0-9][\w&'.\- ]{1,30}?)(?=\s+(?:por|for|with|con|mit|el|on|el d[ií]a)\b|[,]|\.\s|$)/);
  const merchant = at?.[1]?.trim() ?? (lines[0] ?? "").replace(/[€$£]?\s?\d[\d.,]*.*$/, "").trim();
  return { amount, merchant: merchant || "Compra" };
}

/** URL a phone automation opens after a contactless payment. */
export function captureUrl(origin: string) {
  return `${origin.replace(/\/$/, "")}/capture?amount=AMOUNT&merchant=MERCHANT&card=CARD&src=ios`;
}

/** .ics with a daily 2-minute check-in, so the habit survives busy days. */
export function dailyReminderIcs(opts: { hour: number; minute: number; title: string; url: string; body: string }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const now = new Date();
  const d = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const start = `${d}T${pad(opts.hour)}${pad(opts.minute)}00`;
  const end = `${d}T${pad(opts.hour)}${pad((opts.minute + 5) % 60)}00`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Budget Wise//Daily check-in//ES",
    "BEGIN:VEVENT",
    `UID:bw-daily-${Date.now()}@budgetwise`,
    `DTSTAMP:${d}T000000`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "RRULE:FREQ=DAILY",
    `SUMMARY:${opts.title}`,
    `DESCRIPTION:${opts.body} ${opts.url}`,
    `URL:${opts.url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${opts.title}`,
    "TRIGGER:PT0M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

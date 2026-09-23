import type { CategoryId } from "./types";

export interface ReceiptContext {
  items: { name: string; category: CategoryId }[];
  methods: { id: string; name: string; type?: string }[];
}

export interface ReceiptGuess {
  merchant: string;
  amount: number | null;
  category: CategoryId;
  methodId: string;
  matchedExisting: boolean;
}

type MoneyStyle = "eu" | "us" | "latam";

const TOTAL_RE =
  /\b(summe|einkaufswert|endbetrag|zu\s*zahlen|total(?:e|a)?(?:\s+(?:a\s+pagar|due|ttc|general|amount))?|grand\s*total|amount\s*due|importe(?:\s+total)?|valor\s+total|total\s+compra|totaal|montant|a\s*pagar|gegeben|kartenzahlung|balance\s*due|amount\s*tendered)\b/i;

const SKIP_LINE =
  /^(tel\.?|www\.|http|kassenbon|receipt|ticket|factura|rechnung|cif|nif|nit|uid|ust[\s.-]?id|steuer|tva|iva|mwst|vat|gst|abn|terminal|ta-nr|pan|emv|vu-nr|tse|sigz|sign:|artikel|gegeben|change|cambio|vuelto|cash\s*back)\b/i;

const STORES: { name: string; cat: CategoryId; re: RegExp }[] = [
  { name: "Norma", cat: "essential", re: /n[o0]rm[aä]/i },
  { name: "Lidl", cat: "essential", re: /lidl/i },
  { name: "Aldi", cat: "essential", re: /aldi/i },
  { name: "REWE", cat: "essential", re: /rewe/i },
  { name: "Edeka", cat: "essential", re: /edeka/i },
  { name: "Penny", cat: "essential", re: /penny/i },
  { name: "Netto", cat: "essential", re: /netto/i },
  { name: "Kaufland", cat: "essential", re: /kaufland/i },
  { name: "DM", cat: "essential", re: /\bdm[- ]?(drogerie)?\b/i },
  { name: "Rossmann", cat: "essential", re: /rossmann/i },
  { name: "Mercadona", cat: "essential", re: /mercadona/i },
  { name: "Carrefour", cat: "essential", re: /carrefour/i },
  { name: "Auchan", cat: "essential", re: /auchan/i },
  { name: "Tesco", cat: "essential", re: /tesco/i },
  { name: "Sainsbury's", cat: "essential", re: /sainsbury/i },
  { name: "Walmart", cat: "essential", re: /walmart/i },
  { name: "Target", cat: "essential", re: /target/i },
  { name: "Costco", cat: "essential", re: /costco/i },
  { name: "Kroger", cat: "essential", re: /kroger/i },
  { name: "CVS", cat: "essential", re: /\bcvs\b/i },
  { name: "Walgreens", cat: "essential", re: /walgreens/i },
  { name: "Whole Foods", cat: "essential", re: /whole\s*foods/i },
  { name: "Trader Joe's", cat: "essential", re: /trader\s*joe/i },
  { name: "Coles", cat: "essential", re: /\bcoles\b/i },
  { name: "Woolworths", cat: "essential", re: /woolworths|\bwow\b/i },
  { name: "IGA", cat: "essential", re: /\biga\b/i },
  { name: "Éxito", cat: "essential", re: /[eé]xito/i },
  { name: "Olímpica", cat: "essential", re: /ol[ií]mpica/i },
  { name: "D1", cat: "essential", re: /\bd1\b/i },
  { name: "Ara", cat: "essential", re: /\bara\s*(tienda|colombia)?/i },
  { name: "Jumbo", cat: "essential", re: /\bjumbo\b/i },
  { name: "Alkosto", cat: "essential", re: /alkosto/i },
  { name: "Homecenter", cat: "essential", re: /homecenter/i },
  { name: "Oxxo", cat: "essential", re: /\boxxo\b/i },
  { name: "Soriana", cat: "essential", re: /soriana/i },
  { name: "Apotheke", cat: "essential", re: /apotheke|pharmacy|farmacia/i },
  { name: "IKEA", cat: "essential", re: /ikea/i },
  { name: "McDonald's", cat: "flexible", re: /mcdonald/i },
  { name: "Starbucks", cat: "flexible", re: /starbucks/i },
  { name: "Uber Eats", cat: "flexible", re: /uber\s*eats/i },
  { name: "Netflix", cat: "flexible", re: /netflix/i },
  { name: "Spotify", cat: "flexible", re: /spotify/i },
  { name: "eToro", cat: "investing", re: /etoro/i },
  { name: "Trade Republic", cat: "investing", re: /trade\s*republic/i },
];

const FUN_HINTS =
  /\b(netflix|spotify|disney|uber|lieferando|doordash|starbucks|mcdonald|burger king|kfc|cinema|cine|steam|playstation|nintendo|zara|primark|rappi)\b/i;

const INVEST_HINTS = /\b(etoro|trade republic|vanguard|blackrock|scalable|degiro|coinbase|binance)\b/i;

export function detectMoneyStyle(text: string): MoneyStyle {
  if (/\b(cop|col\$|pesos?|nequi|daviplata|bancolombia|[eé]xito|ol[ií]mpica)\b/i.test(text)) return "latam";
  const euHints = (text.match(/€|\beur\b|summe|mwst|betrag|tva\b|totale\b/gi) ?? []).length;
  const euDec = (text.match(/\d+,\d{2}(?:\s*(?:€|eur))?\b/gi) ?? []).length;
  const usDec = (text.match(/\d+\.\d{2}(?:\s*(?:\$|usd|aud|cad))?\b/gi) ?? []).length;
  if (euHints > 0 || euDec > usDec) return "eu";
  return "us";
}

export function parseMoneyToken(raw: string, style: MoneyStyle = "eu"): number | null {
  let t = raw.replace(/[€$£]/g, "").replace(/\b(eur|usd|gbp|chf|aud|cad|cop|mxn|col)\b/gi, "").trim();
  t = t.replace(/[^\d.,-]/g, "");
  if (!t || t === "-" || t === "." || t === ",") return null;
  if (/^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(t)) return Number(t.replace(/\./g, "").replace(",", "."));
  if (/^\d{1,3}(,\d{3})+\.\d{1,2}$/.test(t)) return Number(t.replace(/,/g, ""));
  if (style !== "us" && /^\d{1,3}(\.\d{3})+$/.test(t)) return Number(t.replace(/\./g, ""));
  if (style === "us" && /^\d{1,3}(,\d{3})+$/.test(t)) return Number(t.replace(/,/g, ""));
  if (/^\d+,\d{2}$/.test(t)) return Number(t.replace(",", "."));
  if (/^\d+\.\d{2}$/.test(t)) return Number(t);
  if (style === "latam" && /^\d{4,7}$/.test(t)) return Number(t);
  return null;
}

function skipAmountLine(line: string): boolean {
  if (/%|mwst|ust|iva|tva|vat|gst\b/i.test(line) && !TOTAL_RE.test(line)) return true;
  if (/kg|\/kg|lb\b|\/lb/i.test(line) && !TOTAL_RE.test(line)) return true;
  if (/\b(terminal|id|pan|ta-nr|emv|tse|barcode|nit|abn)\b/i.test(line)) return true;
  if (/\b(change|cambio|vuelto|cashback)\b/i.test(line)) return true;
  return false;
}

export function pickAmount(text: string): number | null {
  const style = detectMoneyStyle(text);
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const scored: { value: number; score: number }[] = [];
  const moneyRe = /\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d{1,7}[.,]\d{2}/g;

  for (const line of lines) {
    if (skipAmountLine(line)) continue;
    const moneyish = /€|\$|£|eur|usd|aud|cop|pesos/i.test(line);
    const totalish = TOTAL_RE.test(line);
    const matches = line.match(moneyRe) ?? [];
    for (const raw of matches) {
      const value = parseMoneyToken(raw, style);
      if (value == null || value < 0.2 || value > 5_000_000) continue;
      let score = 1;
      if (moneyish) score += 3;
      if (totalish) score += 8;
      if (/summe|einkaufswert|zu zahlen|endbetrag|grand total|total a pagar|valor total|amount due/i.test(line)) score += 4;
      scored.push({ value, score });
    }
  }

  const compact = text.replace(/\s+/g, " ");
  for (const m of compact.matchAll(
    /(?:summe|einkaufswert|total(?:e|a)?(?:\s+a\s+pagar)?|grand\s*total|amount\s*due|valor\s*total|eur|usd|aud|cop|€|\$)\s*[:=]?\s*(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d{1,7}[.,]\d{2})/gi,
  )) {
    const value = parseMoneyToken(m[1] ?? "", style);
    if (value != null) scored.push({ value, score: 14 });
  }

  if (scored.length === 0) return null;

  const freq = new Map<number, { n: number; score: number }>();
  for (const s of scored) {
    const cur = freq.get(s.value) ?? { n: 0, score: 0 };
    cur.n += 1;
    cur.score += s.score;
    freq.set(s.value, cur);
  }
  let best: { value: number; rank: number } | null = null;
  for (const [value, { n, score }] of freq) {
    const rank = score + n * 2;
    if (!best || rank > best.rank) best = { value, rank };
  }
  return best?.value ?? null;
}

function lettersOnly(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9äöüßáéíóúñ]/g, "");
}

function isJunkName(s: string): boolean {
  const t = s.trim();
  if (t.length < 3 || t.length > 48) return true;
  if (/[=_<>/#]/.test(t)) return true;
  const letters = (t.match(/[a-zäöüßáéíóúñ]/gi) ?? []).length;
  return letters < 3 || letters / t.replace(/\s/g, "").length < 0.55;
}

export function pickMerchant(
  text: string,
  items: ReceiptContext["items"],
): { merchant: string; matchedExisting: boolean; category?: CategoryId } {
  const hay = lettersOnly(text);

  for (const store of STORES) {
    if (store.re.test(text) || store.re.test(hay)) {
      const existing = items.find((it) => {
        const n = lettersOnly(it.name);
        const s = lettersOnly(store.name);
        return n.includes(s) || s.includes(n);
      });
      if (existing) return { merchant: existing.name, matchedExisting: true, category: existing.category };
      return { merchant: store.name, matchedExisting: false, category: store.cat };
    }
  }

  let best: { merchant: string; matchedExisting: boolean; category?: CategoryId } | null = null;
  let bestLen = 0;
  for (const it of items) {
    const n = lettersOnly(it.name);
    if (n.length < 3) continue;
    if (hay.includes(n)) {
      if (n.length > bestLen) {
        bestLen = n.length;
        best = { merchant: it.name, matchedExisting: true, category: it.category };
      }
    }
  }
  if (best) return best;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => !isJunkName(l) && !SKIP_LINE.test(l) && !TOTAL_RE.test(l) && !/^\d/.test(l));
  const merchant = (lines[0] ?? "Receipt").slice(0, 48);
  return { merchant, matchedExisting: false };
}

export function pickCategory(text: string, matched?: CategoryId): CategoryId {
  if (matched) return matched;
  const store = STORES.find((s) => s.re.test(text));
  if (store) return store.cat;
  if (INVEST_HINTS.test(text)) return "investing";
  if (FUN_HINTS.test(text)) return "flexible";
  return "essential";
}

export function pickMethod(text: string, methods: ReceiptContext["methods"]): string {
  if (!methods.length) return "";
  const hay = text.toLowerCase();

  const scored = methods.map((m) => {
    const n = m.name.toLowerCase();
    let score = 0;
    if (n.length >= 3 && hay.includes(n)) score += 8;
    return { id: m.id, score, name: n, type: m.type };
  });

  const bump = (pred: (m: (typeof methods)[number]) => boolean, pts: number) => {
    for (const m of methods) if (pred(m)) scored.find((s) => s.id === m.id)!.score += pts;
  };

  if (/\b(amex|american express)\b/i.test(text)) bump((m) => /amex|american/i.test(m.name), 10);
  if (/\bv[il1]sa\b/i.test(text) || /visa\s*kontaktlos|kartenzahlung/i.test(text)) {
    bump((m) => /^visa$/i.test(m.name.trim()), 12);
    bump((m) => /\bvisa\b/i.test(m.name) && !/etoro|broker/i.test(m.name), 9);
    bump((m) => /\bvisa\b/i.test(m.name), 5);
    bump((m) => m.type === "credit-card" || m.type === "debit-card", 2);
  }
  if (/\b(mastercard|master card|master\s*card)\b/i.test(text)) bump((m) => /master/i.test(m.name), 10);
  if (/\b(nequi|daviplata|bancolombia|paypal|apple\s*pay|google\s*pay|eftpos)\b/i.test(text)) {
    bump((m) => /nequi|daviplata|bancolombia|paypal|apple|google|eftpos/i.test(m.name), 12);
  }
  const cardPay = /kartenzahlung|credit card|debit|tarjeta/i.test(text);
  if (/\b(barzahlung|\bbar\b|cash|efectivo)\b/i.test(text) && !cardPay && !/visa|mastercard|amex/i.test(text)) {
    bump((m) => m.type === "cash" || /cash|bar|efectivo/i.test(m.name), 10);
  }

  scored.sort((a, b) => b.score - a.score);
  return scored[0]!.score > 0 ? scored[0]!.id : "";
}

export function parseReceiptText(text: string, ctx: ReceiptContext): ReceiptGuess {
  const { merchant, matchedExisting, category: matchedCat } = pickMerchant(text, ctx.items);
  return {
    merchant,
    amount: pickAmount(text),
    category: pickCategory(text, matchedCat),
    methodId: pickMethod(text, ctx.methods),
    matchedExisting,
  };
}

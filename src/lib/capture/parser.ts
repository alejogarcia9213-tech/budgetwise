import { detectMoneyStyle, parseMoneyToken, pickAmount } from "@/lib/receipt";
import type { CategoryId } from "@/lib/types";
import type { CaptureEventKind, NotificationCandidate, WalletChannel } from "./types";

export const PARSER_VERSION = "1";

const DECLINED = /\b(declined|abgelehnt|rechazada|refus[ée]|rifiutata|recusada)\b/i;
const REFUND = /\b(refund|erstattung|reembolso|remboursement|rimborso)\b/i;
const REVERSAL = /\b(reversal|storno|anulaci[oó]n|annulation)\b/i;

const WALLET_PACKAGES = [
  "com.google.android.apps.walletnfcrel",
  "com.google.android.gms",
  "com.google.android.apps.nbu.paisa.user",
];

export function normalizeMerchant(raw: string): string {
  let s = raw.replace(/\s+/g, " ").trim();
  s = s.replace(/\*+\d+$/g, "").replace(/\s+\d{3,}$/g, "").trim();
  s = s.replace(/\b(markt|market|gmbh|inc|ltd|llc|s\.?a\.?s?)\b/gi, "").trim();
  if (!s) return raw.trim() || "Unknown";
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function detectEventKind(text: string): CaptureEventKind {
  if (DECLINED.test(text)) return "declined";
  if (REFUND.test(text)) return "refund";
  if (REVERSAL.test(text)) return "reversal";
  if (/\b(purchase|zahlung|pago|paid|compra|payment)\b/i.test(text)) return "purchase";
  return "unknown";
}

export function detectChannel(pkg: string): WalletChannel {
  if (WALLET_PACKAGES.some((p) => pkg === p || pkg.includes("wallet"))) return "google_wallet";
  if (pkg) return "bank_app";
  return "unknown";
}

export function extractLastFour(text: string): string | null {
  const m = text.match(/(?:••••|ending|endigt|terminada|xxxx|\*{4,})\s*(\d{4})\b/i) ?? text.match(/\b(\d{4})\s*$/);
  if (!m) return null;
  const four = m[1] ?? "";
  if (/^(20\d{2}|19\d{2})$/.test(four)) return null;
  return four;
}

function guessCurrency(text: string, fallback: string): string {
  if (/€|\beur\b/i.test(text)) return "EUR";
  if (/\bCOP\b|col\$|pesos/i.test(text)) return "COP";
  if (/\bAUD\b/.test(text)) return "AUD";
  if (/\bGBP\b|£/.test(text)) return "GBP";
  if (/\$|\bUSD\b/.test(text)) return "USD";
  return fallback;
}

export function fingerprintOf(input: {
  merchantNormalized: string;
  amountMinor: number | null;
  day: string;
  lastFour: string | null;
  pkg: string;
}): string {
  const base = [
    input.merchantNormalized.toLowerCase(),
    String(input.amountMinor ?? ""),
    input.day,
    input.lastFour ?? "",
    input.pkg,
  ].join("|");
  let h = 5381;
  for (let i = 0; i < base.length; i++) h = (h * 33) ^ base.charCodeAt(i);
  return `fp_${(h >>> 0).toString(16)}`;
}

export function parseNotification(
  n: NotificationCandidate,
  opts: {
    currency: string;
    items: { name: string; category: CategoryId }[];
    methods: { id: string; name: string }[];
    rules: { merchant: string; categoryId: CategoryId }[];
    maps: { sourceApp: string; lastFour?: string; methodId: string }[];
  },
) {
  const blob = `${n.title}\n${n.text}`;
  const eventKind = detectEventKind(blob);
  const merchantOriginal = (n.title || n.text.split("\n")[0] || "").trim();
  const merchantNormalized = normalizeMerchant(merchantOriginal);
  const amount = eventKind === "declined" ? null : pickAmount(blob);
  const style = detectMoneyStyle(blob);
  void style;
  const amountMinor = amount == null ? null : Math.round(amount * 100);
  const currencyCode = guessCurrency(blob, opts.currency);
  const lastFour = extractLastFour(blob);
  const occurred = new Date(n.postedAt || Date.now());
  const occurredAt = Number.isNaN(occurred.getTime()) ? new Date().toISOString() : occurred.toISOString();
  const day = occurredAt.slice(0, 10);

  let categoryId: CategoryId | null = null;
  let categoryConfidence = 0;
  const rule = opts.rules.find((r) => r.merchant.toLowerCase() === merchantNormalized.toLowerCase());
  if (rule) {
    categoryId = rule.categoryId;
    categoryConfidence = 0.95;
  } else {
    const hit = opts.items.find((it) => it.name.toLowerCase().includes(merchantNormalized.toLowerCase()) || merchantNormalized.toLowerCase().includes(it.name.toLowerCase()));
    if (hit) {
      categoryId = hit.category;
      categoryConfidence = 0.7;
    }
  }

  let paymentMethodId: string | null = null;
  let paymentMethodConfidence = 0;
  const mapHit = opts.maps.find(
    (m) => m.sourceApp === n.packageName && (!m.lastFour || m.lastFour === (lastFour ?? "")),
  );
  if (mapHit) {
    paymentMethodId = mapHit.methodId;
    paymentMethodConfidence = mapHit.lastFour ? 0.9 : 0.55;
  } else if (lastFour) {
    const named = opts.methods.find((m) => m.name.includes(lastFour));
    if (named) {
      paymentMethodId = named.id;
      paymentMethodConfidence = 0.6;
    }
  }

  return {
    eventKind,
    merchantOriginal,
    merchantNormalized,
    amountMinor,
    currencyCode,
    occurredAt,
    cardLastFour: lastFour,
    categoryId,
    categoryConfidence,
    paymentMethodId,
    paymentMethodConfidence,
    walletChannel: detectChannel(n.packageName),
    fingerprint: fingerprintOf({
      merchantNormalized,
      amountMinor,
      day,
      lastFour,
      pkg: n.packageName,
    }),
    parserVersion: PARSER_VERSION,
  };
}

export { parseMoneyToken };

# Budget Wise · Captura automática (NFC) + registro en 3 segundos

Todo este código ya está probado: typecheck ✓, build ✓, 29 tests de finanzas ✓, revisado en móvil (390 px) en dev y en producción.

## PASO 1 · Pega este mensaje en Grok Builder (proyecto Budget Wise)

```text
Quiero mejorar Budget Wise para que registrar gastos sea casi automático. NO cambies
nada de lo que ya existe salvo lo que indico. Crea/edita exactamente estos archivos
con el código que te paso a continuación (te los pego en los siguientes mensajes):

NUEVOS:
1. src/lib/capture/quick.ts          → parser de montos ("23,90", "$45.000", "1.234,56 €"),
                                        registro en 1 línea, texto compartido de SMS del banco,
                                        adivinar categoría, recordatorio .ics diario.
2. src/lib/capture/copy.ts           → textos ES/EN/DE de la captura.
3. src/components/capture/quick-add.tsx → tarjeta "Regístralo en 3 segundos" (un input + Enter).
4. src/routes/capture.tsx            → ruta /capture?amount=&merchant=&card=&src= y
                                        /capture?text= (Compartir). Crea una sugerencia y
                                        muestra Confirmar / No es una compra.
5. src/components/settings/auto-capture.tsx → guía iPhone (Atajos → Automatización →
                                        Transacción) y Android (MacroDroid / Compartir),
                                        botón copiar enlace, probar, recordatorio diario.

EDITADOS (aplica el diff del PASO 3):
- src/lib/capture/types.ts  (CaptureSource, apple_pay, DirectCapture)
- src/lib/store.ts          (nueva acción ingestCapture)
- src/components/capture/suggestion-inbox.tsx (prop excludeId, etiqueta de origen)
- src/components/planner/planner-view.tsx    (<QuickAdd /> debajo de <SuggestionInbox />)
- src/components/settings/settings-view.tsx  (<AutoCaptureSettings /> arriba de Wallet)
- src/components/app-shell.tsx              (no mostrar el tour en /capture)
- scripts/brand-lock.mjs   (manifest: shortcuts + share_target)

Después: corre npm run typecheck y npm run build, abre /capture?amount=12.50&merchant=Cafe&card=4242&src=ios
y confirma que aparece "Compra detectada" con botón Confirmar. No agregues login ni base de datos.
```

## PASO 2 · Archivos nuevos (pégalos completos)

### `src/lib/capture/quick.ts`

```ts
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
```

### `src/lib/capture/copy.ts`

```ts
import type { Lang } from "@/lib/i18n";

const en = {
  quickTitle: "Log it in 3 seconds",
  quickPh: "12.50 coffee  ·  Rewe 23,90  ·  45000 market #fixed",
  quickHint: "Amount + where. Tags: #fixed, #invest, #fun. Enter to save.",
  quickSaved: "Saved: {name} · {amount}",
  quickBad: "Type an amount, e.g. 12.50 coffee",
  autoTitle: "Automatic capture when you pay with your phone",
  autoIntro:
    "Every time you tap to pay (NFC), your phone opens Budget Wise with the amount and store already filled in. You only confirm. Nothing is added without your OK.",
  iphone: "iPhone",
  android: "Android",
  iosSteps: [
    "Open the Shortcuts app → Automation → + → Transaction (Wallet).",
    "Choose your cards and select \"Run Immediately\".",
    "Add the action \"URL\" and paste the link below. Replace AMOUNT, MERCHANT and CARD with the magic variables Amount, Merchant and Card (tap each word).",
    "Add the action \"Open URLs\". Done — pay with your iPhone and the purchase is waiting for you.",
  ],
  androidSteps: [
    "Install MacroDroid (free) and give it notification access.",
    "Trigger: Notification received → app Google Wallet (and your bank app).",
    "Action: Open website / URL → paste the link below, using [notification_title] as MERCHANT and [notification_text] in a text= parameter.",
    "Or the simplest way: long-press any bank notification or SMS → Share → Budget Wise.",
  ],
  iosNote:
    "iPhone tip: Shortcuts opens links in Safari, and Safari keeps its data apart from the home-screen icon. Use Budget Wise from a Safari tab (or turn on device sync) so captured purchases land in the same budget.",
  androidUrl: "Android link (the app reads the amount from the text):",
  copy: "Copy link",
  copied: "Copied",
  test: "Try it now",
  reminderTitle: "Daily 2-minute check-in",
  reminderBody: "Missed a cash payment? A calendar reminder at 9:00 pm brings you back to confirm the day.",
  reminderBtn: "Add reminder to my calendar",
  reminderEvent: "Budget Wise · 2 minutes for my freedom",
  reminderDesc: "Confirm today's purchases:",
  captured: "Purchase detected",
  capturedHint: "Check it and confirm. It goes into your budget for this month.",
  confirm: "Confirm",
  edit: "Edit",
  discard: "Not a purchase",
  done: "Added to your budget",
  nothing: "Nothing to capture in this link.",
  home: "Go to my budget",
  pendingCount: "{n} purchases waiting for you",
  streak: "{n}-day streak",
  sharedFrom: "From shared text",
};

type CaptureCopy = typeof en;

const es: CaptureCopy = {
  quickTitle: "Regístralo en 3 segundos",
  quickPh: "12.500 café  ·  Éxito 45.000  ·  arriendo 1.200.000 #fijo",
  quickHint: "Monto + dónde. Etiquetas: #fijo, #inv, #ocio. Enter para guardar.",
  quickSaved: "Guardado: {name} · {amount}",
  quickBad: "Escribe un monto, por ejemplo 12.500 café",
  autoTitle: "Captura automática al pagar con el celular",
  autoIntro:
    "Cada vez que pagas acercando el celular (NFC), Budget Wise se abre con el monto y el comercio ya escritos. Tú solo confirmas. Nada entra al presupuesto sin tu OK.",
  iphone: "iPhone",
  android: "Android",
  iosSteps: [
    "Abre la app Atajos → Automatización → + → Transacción (Wallet).",
    "Elige tus tarjetas y marca \"Ejecutar inmediatamente\".",
    "Agrega la acción \"URL\" y pega el enlace de abajo. Cambia AMOUNT, MERCHANT y CARD por las variables de la transacción: Importe, Comercio y Tarjeta (toca cada palabra).",
    "Agrega la acción \"Abrir URL\". Listo: paga con tu iPhone y la compra te estará esperando.",
  ],
  androidSteps: [
    "Instala MacroDroid (gratis) y dale acceso a notificaciones.",
    "Disparador: Notificación recibida → app Google Wallet (y la app de tu banco).",
    "Acción: Abrir sitio web / URL → pega el enlace de abajo, usando [notification_title] como MERCHANT y [notification_text] en el parámetro text=.",
    "O lo más fácil: mantén presionada cualquier notificación o SMS del banco → Compartir → Budget Wise.",
  ],
  iosNote:
    "Tip para iPhone: Atajos abre los enlaces en Safari, y Safari guarda sus datos separados del ícono de la pantalla de inicio. Usa Budget Wise desde una pestaña de Safari (o activa la sincronización entre dispositivos) para que las compras lleguen al mismo presupuesto.",
  androidUrl: "Enlace para Android (la app lee el monto del texto):",
  copy: "Copiar enlace",
  copied: "Copiado",
  test: "Probar ahora",
  reminderTitle: "Revisión diaria de 2 minutos",
  reminderBody: "¿Pagaste en efectivo? Un recordatorio a las 9:00 p. m. te trae de vuelta para cerrar el día.",
  reminderBtn: "Agregar recordatorio a mi calendario",
  reminderEvent: "Budget Wise · 2 minutos por mi libertad",
  reminderDesc: "Confirma las compras de hoy:",
  captured: "Compra detectada",
  capturedHint: "Revísala y confirma. Entra al presupuesto de este mes.",
  confirm: "Confirmar",
  edit: "Editar",
  discard: "No es una compra",
  done: "Agregado a tu presupuesto",
  nothing: "Este enlace no trae ninguna compra.",
  home: "Ir a mi presupuesto",
  pendingCount: "{n} compras te esperan",
  streak: "Racha de {n} días",
  sharedFrom: "Desde texto compartido",
};

const de: CaptureCopy = {
  ...en,
  quickTitle: "In 3 Sekunden erfasst",
  quickPh: "12,50 Kaffee  ·  Rewe 23,90  ·  Miete 900 #fix",
  quickHint: "Betrag + wo. Tags: #fix, #invest, #fun. Enter zum Speichern.",
  quickSaved: "Gespeichert: {name} · {amount}",
  autoTitle: "Automatisch erfassen beim Bezahlen mit dem Handy",
  autoIntro:
    "Bei jeder kontaktlosen Zahlung (NFC) öffnet sich Budget Wise mit Betrag und Händler. Du bestätigst nur.",
  captured: "Kauf erkannt",
  confirm: "Bestätigen",
  edit: "Bearbeiten",
  discard: "Kein Kauf",
  done: "Zum Budget hinzugefügt",
  home: "Zu meinem Budget",
};

const COPY: Partial<Record<Lang, CaptureCopy>> = { en, es, de };

type Key = { [K in keyof CaptureCopy]: CaptureCopy[K] extends string ? K : never }[keyof CaptureCopy];

export function ct(lang: Lang, key: Key, vars?: Record<string, string | number>): string {
  let s = (COPY[lang] ?? en)[key] ?? en[key];
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export function steps(lang: Lang, key: "iosSteps" | "androidSteps"): string[] {
  return (COPY[lang] ?? en)[key];
}
```

### `src/components/capture/quick-add.tsx`

```tsx
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { Panel } from "@/components/finance/panel";
import { ct } from "@/lib/capture/copy";
import { guessCategory, parseQuickText } from "@/lib/capture/quick";
import { formatMoney } from "@/lib/money";
import { useAppStore, useProfile } from "@/lib/store";
import { cn } from "@/lib/utils";

const CAT_DOT: Record<string, string> = { essential: "#6E7BFF", investing: "#13C636", flexible: "#F5A623" };

/** One input, one Enter. The fastest way to keep the budget honest. */
export function QuickAdd() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const [text, setText] = useState("");

  const known = useMemo(
    () => [...(profile.months[month]?.items ?? []), ...profile.recurring].map((i) => ({ name: i.name, category: i.category })),
    [profile, month],
  );
  const parsed = parseQuickText(text, currency);
  const preview = parsed
    ? { ...parsed, category: parsed.forced ?? guessCategory(parsed.name, profile.merchantCategoryRules ?? [], known).category }
    : null;

  const recent = useMemo(() => {
    const seen = new Set<string>();
    return [...profile.transactions]
      .filter((t) => t.type === "expense")
      .reverse()
      .filter((t) => (seen.has(t.name.toLowerCase()) ? false : (seen.add(t.name.toLowerCase()), true)))
      .slice(0, 5);
  }, [profile.transactions]);

  const save = () => {
    if (!preview) {
      toast.error(ct(lang, "quickBad"));
      return;
    }
    const name = preview.name || "Gasto";
    useAppStore.getState().addItem({ name, amount: preview.amount, category: preview.category });
    toast.success(ct(lang, "quickSaved", { name, amount: formatMoney(preview.amount, currency, lang) }));
    setText("");
  };

  return (
    <Panel accent="commit">
      <div className="flex items-center gap-2">
        <Zap className="size-5 text-[#8B95FF]" />
        <h2 className="text-lg font-semibold">{ct(lang, "quickTitle")}</h2>
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          inputMode="text"
          enterKeyHint="done"
          autoComplete="off"
          aria-label={ct(lang, "quickTitle")}
          placeholder={ct(lang, "quickPh")}
          className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-elevated px-4 text-base outline-none placeholder:text-subtle focus:border-[#8B95FF]"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-xl bg-[#6E7BFF] px-5 font-semibold text-white disabled:opacity-50"
          disabled={!preview}
        >
          +
        </button>
      </form>
      <p className="mt-2 min-h-5 text-sm text-muted">
        {preview ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: CAT_DOT[preview.category] }} />
            {preview.name || "Gasto"} · {formatMoney(preview.amount, currency, lang)}
          </span>
        ) : (
          ct(lang, "quickHint")
        )}
      </p>
      {recent.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {recent.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setText(`${r.name} ${String(r.amount)}`)}
              className={cn("h-9 rounded-full border border-border px-3 text-sm text-muted hover:text-fg")}
            >
              {r.name} · {formatMoney(r.amount, currency, lang)}
            </button>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}
```

### `src/routes/capture.tsx`

```tsx
import { useEffect, useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Nfc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/finance/panel";
import { QuickAdd } from "@/components/capture/quick-add";
import { SuggestionInbox } from "@/components/capture/suggestion-inbox";
import { ct } from "@/lib/capture/copy";
import { parseLooseAmount, parseSharedText } from "@/lib/capture/quick";
import type { CaptureSource } from "@/lib/capture/types";
import { currentMonthKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { useAppStore, useProfile } from "@/lib/store";

type CaptureSearch = {
  amount?: string;
  merchant?: string;
  card?: string;
  src?: string;
  text?: string;
  title?: string;
  auto?: string;
};

const str = (v: unknown) => (v == null || v === "" ? undefined : String(v).slice(0, 500));

export const Route = createFileRoute("/capture")({
  validateSearch: (s: Record<string, unknown>): CaptureSearch => ({
    amount: str(s.amount),
    merchant: str(s.merchant),
    card: str(s.card),
    src: str(s.src),
    text: str(s.text),
    title: str(s.title),
    auto: str(s.auto),
  }),
  component: CapturePage,
});

const SOURCES: Record<string, CaptureSource> = { ios: "ios_shortcut", android: "android_automation", share: "share" };

function CapturePage() {
  const search = Route.useSearch();
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const hydrated = useAppStore((s) => s.hydrated);
  const profile = useProfile();
  const ran = useRef(false);
  const [capturedId, setCapturedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "captured" | "done" | "empty">("idle");

  useEffect(() => {
    if (!hydrated || ran.current) return;
    ran.current = true;
    const hasPayload = search.amount || search.text || search.title;
    if (!hasPayload) return;
    const st = useAppStore.getState();
    if (st.activeMonth !== currentMonthKey()) st.setMonth(currentMonthKey());
    let amount = parseLooseAmount(search.amount, currency);
    let merchant = search.merchant ?? "";
    if (amount == null && (search.text || search.title)) {
      const shared = parseSharedText(`${search.title ?? ""}\n${search.text ?? ""}`, currency);
      amount = shared.amount;
      merchant = merchant || shared.merchant;
    }
    if (amount == null) {
      setStatus("empty");
      return;
    }
    const card = search.card?.match(/\d{4}/)?.[0] ?? search.text?.match(/(?:\*|•+|x{2,}|terminada en|ending)\s?(\d{4})\b/i)?.[1] ?? null;
    const id = st.ingestCapture({
      merchant,
      amount,
      card,
      source: SOURCES[search.src ?? ""] ?? (search.text ? "share" : "link"),
    });
    if (!id) {
      setStatus("empty");
      return;
    }
    if (search.auto === "1") {
      useAppStore.getState().confirmSuggestion(id);
      setStatus("done");
    } else {
      setCapturedId(id);
      setStatus("captured");
    }
    // Keep the address bar clean so a reload doesn't re-capture.
    window.history.replaceState(null, "", "/capture");
  }, [hydrated, search, currency]);

  const sug = (profile.captureSuggestions ?? []).find((s) => s.id === capturedId);
  const doneNow = status === "done" || (status === "captured" && sug?.status === "accepted");
  const discarded = status === "captured" && sug?.status === "dismissed";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      {status === "captured" && sug && sug.status === "pending" ? (
        <Panel accent="commit">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Nfc className="size-4" /> {ct(lang, "captured")}
          </div>
          <p className="mt-3 break-words text-4xl font-bold tracking-tight tabular-nums">
            {formatMoney((sug.amountMinor ?? 0) / 100, sug.currencyCode || currency, lang)}
          </p>
          <p className="mt-1 text-lg">{sug.merchantNormalized}</p>
          <p className="mt-1 text-sm text-muted">
            {sug.sourceAppLabel}
            {sug.cardLastFour ? ` · •••• ${sug.cardLastFour}` : ""}
          </p>
          <p className="mt-3 text-sm text-muted">{ct(lang, "capturedHint")}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button className="h-12 text-base" onClick={() => useAppStore.getState().confirmSuggestion(sug.id)}>
              {ct(lang, "confirm")}
            </Button>
            <Button variant="ghost" className="h-12" onClick={() => useAppStore.getState().dismissSuggestion(sug.id)}>
              {ct(lang, "discard")}
            </Button>
          </div>
        </Panel>
      ) : null}

      {doneNow ? (
        <Panel accent="invest">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-6 text-[#13C636]" />
            <p className="font-semibold">{ct(lang, "done")}</p>
          </div>
          <Button asChild className="mt-4 w-full">
            <Link to="/">{ct(lang, "home")}</Link>
          </Button>
        </Panel>
      ) : null}

      {discarded ? (
        <Panel>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/">{ct(lang, "home")}</Link>
          </Button>
        </Panel>
      ) : null}

      {status === "empty" ? (
        <Panel>
          <p className="text-sm text-muted">{ct(lang, "nothing")}</p>
        </Panel>
      ) : null}

      <SuggestionInbox excludeId={capturedId} />
      <QuickAdd />
    </div>
  );
}
```

### `src/components/settings/auto-capture.tsx`

```tsx
import { useEffect, useState } from "react";
import { BellRing, Copy, Nfc, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/finance/panel";
import { ct, steps } from "@/lib/capture/copy";
import { captureUrl, dailyReminderIcs } from "@/lib/capture/quick";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Os = "ios" | "android";

function detectOs(): Os {
  if (typeof navigator === "undefined") return "android";
  return /iphone|ipad|ipod|macintosh/i.test(navigator.userAgent) ? "ios" : "android";
}

export function AutoCaptureSettings() {
  const lang = useAppStore((s) => s.lang);
  const [os, setOs] = useState<Os>("android");
  const [origin, setOrigin] = useState("https://budgetwise.grok.me");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setOs(detectOs());
    setOrigin(window.location.origin);
  }, []);

  const iosLink = captureUrl(origin);
  const androidLink = `${origin}/capture?src=android&merchant=[notification_title]&text=[notification_text]`;
  const link = os === "ios" ? iosLink : androidLink;

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      window.prompt("", value);
    }
  };

  const downloadReminder = () => {
    const ics = dailyReminderIcs({
      hour: 21,
      minute: 0,
      title: ct(lang, "reminderEvent"),
      body: ct(lang, "reminderDesc"),
      url: `${origin}/capture`,
    });
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "budget-wise-daily.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <Panel accent="commit" id="auto-capture">
      <div className="flex items-center gap-2">
        <Nfc className="size-5 text-[#8B95FF]" />
        <h2 className="text-lg font-semibold">{ct(lang, "autoTitle")}</h2>
      </div>
      <p className="mt-2 text-sm text-muted">{ct(lang, "autoIntro")}</p>

      <div role="tablist" className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-elevated p-1">
        {(["ios", "android"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={os === k}
            onClick={() => setOs(k)}
            className={cn(
              "flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium",
              os === k ? "bg-surface text-fg shadow-sm" : "text-muted",
            )}
          >
            <Smartphone className="size-4" />
            {ct(lang, k === "ios" ? "iphone" : "android")}
          </button>
        ))}
      </div>

      <ol className="mt-4 space-y-3">
        {steps(lang, os === "ios" ? "iosSteps" : "androidSteps").map((step, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#6E7BFF] text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      {os === "android" ? <p className="mt-4 text-xs text-muted">{ct(lang, "androidUrl")}</p> : null}
      <div className="mt-2 flex flex-col items-stretch gap-2 rounded-xl border border-border bg-elevated p-2">
        <code className="min-w-0 flex-1 break-all px-1 text-xs leading-relaxed">{link}</code>
        <Button size="sm" variant="secondary" onClick={() => void copy(link)}>
          <Copy className="size-4" />
          {copied === link ? ct(lang, "copied") : ct(lang, "copy")}
        </Button>
      </div>
      {os === "ios" ? <p className="mt-3 text-xs text-muted">{ct(lang, "iosNote")}</p> : null}

      <Button asChild variant="secondary" className="mt-3 w-full">
        <a href={`${origin}/capture?amount=12.50&merchant=Cafe%20Demo&card=4242&src=${os}`}>{ct(lang, "test")}</a>
      </Button>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <BellRing className="size-4 text-[#F5A623]" />
          <h3 className="font-semibold">{ct(lang, "reminderTitle")}</h3>
        </div>
        <p className="mt-1 text-sm text-muted">{ct(lang, "reminderBody")}</p>
        <Button variant="secondary" className="mt-3 w-full" onClick={downloadReminder}>
          {ct(lang, "reminderBtn")}
        </Button>
      </div>
    </Panel>
  );
}
```

## PASO 3 · Cambios en archivos existentes (diff exacto)

Líneas con `+` se agregan, con `-` se quitan.

```diff
diff --git a/scripts/brand-lock.mjs b/scripts/brand-lock.mjs
index 22b530c..02a5682 100644
--- a/scripts/brand-lock.mjs
+++ b/scripts/brand-lock.mjs
@@ -22,6 +22,13 @@ export function renderBrandManifest() {
         { src: BRAND_ICON_192, sizes: "192x192", type: "image/png" },
         { src: BRAND_ICON_512, sizes: "512x512", type: "image/png" },
       ],
+      // Long-press the home-screen icon → straight to logging a purchase.
+      shortcuts: [
+        { name: "Registrar gasto", short_name: "Gasto", url: "/capture", icons: [{ src: BRAND_ICON_192, sizes: "192x192" }] },
+        { name: "Captura automática", short_name: "Auto", url: "/settings#auto-capture", icons: [{ src: BRAND_ICON_192, sizes: "192x192" }] },
+      ],
+      // Android: share a bank SMS / notification text → Budget Wise reads the amount.
+      share_target: { action: "/capture", method: "GET", params: { title: "title", text: "text", url: "url" } },
     },
     null,
     2,
diff --git a/src/components/app-shell.tsx b/src/components/app-shell.tsx
index 9c7ba84..ef7d81e 100644
--- a/src/components/app-shell.tsx
+++ b/src/components/app-shell.tsx
@@ -210,7 +210,7 @@ export function AppShell({ children }: { children: ReactNode }) {
 
       <Toaster theme={theme} position="top-center" />
       <SetupGate />
-      <AppTour />
+      {pathname.startsWith("/capture") ? null : <AppTour />}
     </div>
   );
 }
diff --git a/src/components/capture/suggestion-inbox.tsx b/src/components/capture/suggestion-inbox.tsx
index 1ce1b73..3a52fc8 100644
--- a/src/components/capture/suggestion-inbox.tsx
+++ b/src/components/capture/suggestion-inbox.tsx
@@ -11,12 +11,12 @@ import { formatMoney } from "@/lib/money";
 import type { CategoryId } from "@/lib/types";
 import { useAppStore, useProfile } from "@/lib/store";
 
-export function SuggestionInbox() {
+export function SuggestionInbox({ excludeId }: { excludeId?: string | null } = {}) {
   const lang = useAppStore((s) => s.lang);
   const currency = useAppStore((s) => s.currency);
   const enabled = useAppStore((s) => s.smartTransactionCapture);
   const profile = useProfile();
-  const pending = (profile.captureSuggestions ?? []).filter((s) => s.status === "pending");
+  const pending = (profile.captureSuggestions ?? []).filter((s) => s.status === "pending" && s.id !== excludeId);
   const [editId, setEditId] = useState<string | null>(null);
   if (!enabled || pending.length === 0) return null;
 
@@ -31,7 +31,7 @@ export function SuggestionInbox() {
             <p className="text-sm text-muted">
               {s.amountMinor != null ? formatMoney(s.amountMinor / 100, currency, lang) : "—"}
               {s.cardLastFour ? ` · •••• ${s.cardLastFour}` : ""}
-              {` · ${t(lang, "wallet.viaWallet")}`}
+              {s.walletChannel === "google_wallet" ? ` · ${t(lang, "wallet.viaWallet")}` : s.sourceAppLabel ? ` · ${s.sourceAppLabel}` : ""}
             </p>
             <div className="mt-2 flex flex-wrap gap-2">
               <Button size="sm" onClick={() => useAppStore.getState().confirmSuggestion(s.id)}>
diff --git a/src/components/planner/planner-view.tsx b/src/components/planner/planner-view.tsx
index 173c674..f4aaf25 100644
--- a/src/components/planner/planner-view.tsx
+++ b/src/components/planner/planner-view.tsx
@@ -6,6 +6,7 @@ import { CalculatorView } from "@/components/calculator/calculator-view";
 import { Panel } from "@/components/finance/panel";
 import { ReceiptScanButton } from "@/components/finance/receipt-scan";
 import { SuggestionInbox } from "@/components/capture/suggestion-inbox";
+import { QuickAdd } from "@/components/capture/quick-add";
 import { t } from "@/lib/i18n";
 import { useAppStore } from "@/lib/store";
 
@@ -18,6 +19,7 @@ export function PlannerView() {
         <IncomeCard />
       </div>
       <SuggestionInbox />
+      <QuickAdd />
       <div data-tour="tour-scan">
         <ReceiptScanButton />
       </div>
diff --git a/src/components/settings/settings-view.tsx b/src/components/settings/settings-view.tsx
index 0d4807d..a7badb0 100644
--- a/src/components/settings/settings-view.tsx
+++ b/src/components/settings/settings-view.tsx
@@ -7,6 +7,7 @@ import { Switch } from "@/components/ui/switch";
 import { SpreadsheetImportButtons } from "@/components/settings/spreadsheet-import";
 import { DeviceSyncPanel } from "@/components/settings/device-sync";
 import { WalletCaptureSettings } from "@/components/settings/wallet-capture";
+import { AutoCaptureSettings } from "@/components/settings/auto-capture";
 import { Panel } from "@/components/finance/panel";
 import { t, LANGS, type Lang } from "@/lib/i18n";
 import { CURRENCIES } from "@/lib/money";
@@ -221,6 +222,7 @@ export function SettingsView() {
 
       <DeviceSyncPanel />
 
+      <AutoCaptureSettings />
       <WalletCaptureSettings />
 
       <Panel>
diff --git a/src/lib/capture/types.ts b/src/lib/capture/types.ts
index 445f0e3..78410f1 100644
--- a/src/lib/capture/types.ts
+++ b/src/lib/capture/types.ts
@@ -2,13 +2,14 @@ import type { CategoryId } from "@/lib/types";
 
 export type SuggestionStatus = "pending" | "accepted" | "dismissed" | "merged" | "expired";
 export type CaptureEventKind = "purchase" | "refund" | "reversal" | "declined" | "unknown";
-export type WalletChannel = "google_wallet" | "bank_app" | "unknown";
+export type CaptureSource = "android_notification" | "ios_shortcut" | "android_automation" | "share" | "link";
+export type WalletChannel = "google_wallet" | "apple_pay" | "bank_app" | "unknown";
 
 export interface CapturedPurchaseSuggestion {
   id: string;
   status: SuggestionStatus;
   eventKind: CaptureEventKind;
-  source: "android_notification";
+  source: CaptureSource;
   sourceAppPackage: string;
   sourceAppLabel?: string;
   walletChannel: WalletChannel;
@@ -47,3 +48,12 @@ export interface NotificationCandidate {
   postedAt: number;
   key?: string;
 }
+
+export interface DirectCapture {
+  merchant: string;
+  amount: number;
+  currency?: string;
+  card?: string | null;
+  source: CaptureSource;
+  occurredAt?: number;
+}
diff --git a/src/lib/store.ts b/src/lib/store.ts
index 037bfdf..2854463 100644
--- a/src/lib/store.ts
+++ b/src/lib/store.ts
@@ -5,8 +5,9 @@ import { currentMonthKey, dateInMonth, isoToday, prevMonthKey } from "./dates";
 import { createBudgetWiseStorage } from "./idb-storage";
 import { categoryToType, emptyMonth, installmentOf, isDebtActive, isLargeActive, isSpendCat, pendingAutos, rememberRecurring, findMergeableItem, findMergeableTx } from "./budget";
 import { detectVisitorLocale } from "./locale-detect";
-import { parseNotification } from "./capture/parser";
-import type { CapturedPurchaseSuggestion, NotificationCandidate, WalletMethodMap } from "./capture/types";
+import { fingerprintOf, parseNotification } from "./capture/parser";
+import { guessCategory } from "./capture/quick";
+import type { CapturedPurchaseSuggestion, DirectCapture, NotificationCandidate, WalletMethodMap } from "./capture/types";
 import { roundMoney } from "./money";
 import type { Lang } from "./i18n";
 import type { CurrencyCode } from "./money";
@@ -68,6 +69,7 @@ export interface AppState {
   setTourComplete: (v: boolean) => void;
   applyVisitorLocale: () => void;
   ingestNotification: (n: NotificationCandidate) => string | null;
+  ingestCapture: (c: DirectCapture) => string | null;
   confirmSuggestion: (id: string, patch?: { name?: string; amount?: number; category?: CategoryId; methodId?: string; alwaysCategory?: boolean }) => void;
   dismissSuggestion: (id: string) => void;
   clearSuggestions: () => void;
@@ -450,6 +452,60 @@ export const useAppStore = create<AppState>()(
         );
         return id;
       },
+      ingestCapture: (c) => {
+        const s = get();
+        const p = s.profiles.find((x) => x.id === s.activeProfileId) ?? s.profiles[0];
+        if (!p || !(c.amount > 0)) return null;
+        const merchant = c.merchant.trim() || "Compra";
+        const pkg = c.source === "ios_shortcut" ? "apple.wallet" : c.source;
+        const parsed = parseNotification(
+          { packageName: pkg, title: merchant, text: c.card ? `•••• ${c.card}` : "", postedAt: c.occurredAt ?? Date.now() },
+          {
+            currency: s.currency,
+            items: [...(p.months[s.activeMonth]?.items ?? []), ...p.recurring].map((it) => ({ name: it.name, category: it.category })),
+            methods: p.paymentMethods.map((m) => ({ id: m.id, name: m.name })),
+            rules: p.merchantCategoryRules ?? [],
+            maps: p.walletMethodMaps ?? [],
+          },
+        );
+        const guess = guessCategory(parsed.merchantNormalized, p.merchantCategoryRules ?? [], [
+          ...(p.months[s.activeMonth]?.items ?? []),
+          ...p.recurring,
+        ]);
+        const amountMinor = Math.round(c.amount * 100);
+        const fingerprint = fingerprintOf({
+          merchantNormalized: parsed.merchantNormalized,
+          amountMinor,
+          day: parsed.occurredAt.slice(0, 10),
+          lastFour: c.card ?? parsed.cardLastFour,
+          pkg,
+        });
+        const all = p.captureSuggestions ?? [];
+        const dupe = all.find((x) => x.fingerprint === fingerprint && Date.now() - Date.parse(x.detectedAt) < 10 * 60_000);
+        if (dupe) return dupe.id;
+        const id = uid();
+        const suggestion: CapturedPurchaseSuggestion = {
+          ...parsed,
+          id,
+          status: "pending",
+          source: c.source,
+          sourceAppPackage: pkg,
+          sourceAppLabel: c.source === "ios_shortcut" ? "Apple Pay" : c.source === "share" ? "Share" : "Wallet",
+          walletChannel: c.source === "ios_shortcut" ? "apple_pay" : parsed.walletChannel,
+          amountMinor,
+          currencyCode: c.currency || s.currency,
+          cardLastFour: c.card ?? parsed.cardLastFour,
+          categoryId: parsed.categoryId ?? guess.category,
+          categoryConfidence: parsed.categoryId ? parsed.categoryConfidence : guess.confidence,
+          fingerprint,
+          detectedAt: new Date().toISOString(),
+        };
+        set({
+          smartTransactionCapture: true,
+          ...withActive(s, (cur) => ({ ...cur, captureSuggestions: [suggestion, ...(cur.captureSuggestions ?? [])].slice(0, 200) })),
+        });
+        return id;
+      },
       confirmSuggestion: (id, patch) => {
         const s = get();
         const p = s.profiles.find((x) => x.id === s.activeProfileId) ?? s.profiles[0];
```

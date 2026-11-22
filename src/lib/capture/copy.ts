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

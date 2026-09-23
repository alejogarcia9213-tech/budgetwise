import { currentMonthKey, nextMonthKey } from "./dates";
import { emptyMonth } from "./budget";
import { roundMoney } from "./money";
import { uid } from "./utils";
import type {
  AllocKey,
  BudgetItem,
  CategoryId,
  ExtraInflow,
  MonthData,
  Profile,
  RecurringExpense,
  Transaction,
} from "./types";

const MONTH_INDEX: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

const SKIP_SHEET = /simulacro|cashflow|hoja\s*\d|template|plantilla/i;
const SKIP_NAME =
  /^(restante|total|assets|liabilities|balance|cashflow|patrimonio|balance\/patrimonio|income amount:?|spend on|ratio\b|r[uü]rup|saveback|inversiones|kindergeld)$/i;
const INFLOW_NAME = /popular investor|cashback|kindergeld|luna serena/i;
const SECTION = /^(assets|liabilities|activos|pasivos|balance|cashflow|ratio\b)/i;

export interface ImportSummary {
  months: number;
  items: number;
  firstMonth: string | null;
  lastMonth: string | null;
  recurring: number;
  inflows: number;
  assetsFound: boolean;
  skippedSheets: string[];
  warnings: string[];
}

export interface ImportResult {
  profile: Profile;
  summary: ImportSummary;
}

function fold(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

export function monthKeyFromSheetName(name: string): string | null {
  if (SKIP_SHEET.test(name)) return null;
  const n = fold(name).replace(/[_./]+/g, " ");
  const m = n.match(/([a-z]+)\s+(20\d{2})/);
  if (!m) return null;
  const month = MONTH_INDEX[m[1] ?? ""];
  if (!month) return null;
  return `${m[2]}-${String(month).padStart(2, "0")}`;
}

export function toNumber(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw !== "string") return null;
  const s = raw.trim().replace(/\s/g, "").replace(",", ".");
  if (!s || !/^-?\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function cellStr(raw: unknown): string {
  if (raw == null) return "";
  if (typeof raw === "string") return raw.trim();
  if (typeof raw === "number") return String(raw);
  return String(raw).trim();
}

function isSkipName(name: string) {
  const n = fold(name);
  if (!n) return true;
  if (SKIP_NAME.test(n)) return true;
  if (n.startsWith("ratio ")) return true;
  if (n.includes("pendiente por repagar")) return true;
  return false;
}

function mapAssetKey(label: string): keyof Profile["assets"] | null {
  const n = fold(label);
  if (!n || SECTION.test(n)) return null;
  if (/ahorros|emergency|fondo/.test(n)) return "savings";
  if (/inversion|invest/.test(n)) return "investments";
  if (/casa|house|property|inmueble/.test(n)) return "property";
  if (/efectivo|cash/.test(n)) return "cash";
  if (/banco|bank/.test(n)) return "bank";
  if (/carro|coche|auto|mueble|electro/.test(n)) return "other";
  return "other";
}

function findIncome(rows: unknown[][]): number {
  for (const row of rows.slice(0, 8)) {
    for (let i = 0; i < row.length; i++) {
      if (/income amount/i.test(cellStr(row[i]))) {
        for (let j = i + 1; j < row.length; j++) {
          const n = toNumber(row[j]);
          if (n != null && n > 0) return roundMoney(n);
        }
      }
    }
  }
  return 0;
}

function findTargets(rows: unknown[][], pairs: { amt: number; cat: CategoryId }[], income: number): Partial<Record<CategoryId, number>> | null {
  if (income <= 0) return null;
  for (let r = 2; r < 6; r++) {
    const row = rows[r] ?? [];
    const nums = pairs.map((p) => toNumber(row[p.amt])).filter((n): n is number => n != null && n > 0);
    if (nums.length < 2) continue;
    const out: Partial<Record<CategoryId, number>> = {};
    for (const p of pairs) {
      const n = toNumber(row[p.amt]);
      if (n != null && n > 0) out[p.cat] = roundMoney((n / income) * 100);
    }
    return out;
  }
  return null;
}

function findPairCols(rows: unknown[][]): { amt: number; name: number; cat: CategoryId }[] {
  const header = rows.find((r) => r.some((c) => /spend on/i.test(cellStr(c)))) ?? [];
  const cols: { amt: number; name: number; cat: CategoryId }[] = [];
  for (let i = 0; i < header.length; i++) {
    const h = fold(cellStr(header[i]));
    if (!h) continue;
    if (/need/.test(h)) cols.push({ amt: i, name: i + 1, cat: "essential" });
    else if (/invest/.test(h)) cols.push({ amt: i, name: i + 1, cat: "investing" });
    else if (/want/.test(h)) cols.push({ amt: i, name: i + 1, cat: "flexible" });
  }
  if (cols.length === 0) {
    return [
      { amt: 0, name: 1, cat: "essential" },
      { amt: 2, name: 3, cat: "investing" },
      { amt: 4, name: 5, cat: "flexible" },
    ];
  }
  return cols;
}

function addItem(
  items: BudgetItem[],
  txs: Transaction[],
  monthKey: string,
  name: string,
  amount: number,
  category: CategoryId,
  day: number,
) {
  const amt = roundMoney(Math.abs(amount));
  if (amt <= 0) return;
  const existing = items.find(
    (it) => it.category === category && it.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );
  if (existing) {
    existing.amount = roundMoney(existing.amount + amt);
    const tx = txs.find((t) => t.itemId === existing.id);
    if (tx) tx.amount = existing.amount;
    return;
  }
  const id = uid();
  items.push({ id, name: name.trim(), amount: amt, category });
  txs.push({
    id: uid(),
    type: category === "investing" ? "investment" : "expense",
    category,
    name: name.trim(),
    amount: amt,
    date: `${monthKey}-${String(Math.min(28, Math.max(1, day))).padStart(2, "0")}`,
    itemId: id,
  });
}

function parseMonthSheet(name: string, rows: unknown[][], until: string) {
  const monthKey = monthKeyFromSheetName(name);
  if (!monthKey || monthKey > until) return null;

  const income = findIncome(rows);
  const pairs = findPairCols(rows);
  const targets = findTargets(rows, pairs, income);
  const items: BudgetItem[] = [];
  const txs: Transaction[] = [];
  const inflows: { name: string; amount: number }[] = [];
  const assets: Partial<Profile["assets"]> = {};
  const debts: { name: string; balance: number }[] = [];

  let section: "none" | "assets" | "liabilities" = "none";
  let day = 2;

  for (let r = 3; r < rows.length; r++) {
    const row = rows[r] ?? [];
    const b = cellStr(row[1]);
    const c = cellStr(row[2]);
    if (/^assets$|^activos$/i.test(b) || /^assets$|^activos$/i.test(c)) {
      section = "assets";
      continue;
    }
    if (/^liabilities$|^pasivos$/i.test(b) || /^liabilities$|^pasivos$/i.test(c)) {
      section = "liabilities";
      continue;
    }
    if (/^(balance|cashflow|ratio)\b/i.test(b) || /^(balance|cashflow|ratio)\b/i.test(c)) {
      section = "none";
      continue;
    }
    if (section === "assets") {
      const label = b || cellStr(row[0]);
      const val = toNumber(row[2]) ?? toNumber(row[1]);
      const key = mapAssetKey(label);
      if (key && val != null) assets[key] = roundMoney((assets[key] ?? 0) + val);
      continue;
    }
    if (section === "liabilities") {
      const label = b || cellStr(row[0]);
      const val = toNumber(row[2]) ?? toNumber(row[1]);
      if (label && val != null && val > 0 && !SECTION.test(label)) {
        debts.push({ name: label, balance: roundMoney(val) });
      }
      continue;
    }

    for (const col of pairs) {
      const amount = toNumber(row[col.amt]);
      const label = cellStr(row[col.name]);
      if (amount == null || !label || isSkipName(label)) continue;
      if (INFLOW_NAME.test(label) || amount < 0) {
        if (INFLOW_NAME.test(label) && Math.abs(amount) >= 20) {
          inflows.push({ name: label, amount: roundMoney(Math.abs(amount)) });
        }
        continue;
      }
      addItem(items, txs, monthKey, label, amount, col.cat, day++);
    }

    for (let i = 6; i + 1 < row.length; i += 2) {
      const amount = toNumber(row[i]);
      const label = cellStr(row[i + 1]);
      if (amount == null || amount <= 0 || !label || isSkipName(label)) continue;
      if (INFLOW_NAME.test(label) || /ingresos negocios/i.test(label)) {
        inflows.push({ name: label, amount: roundMoney(amount) });
      }
    }
  }

  if (income > 0) {
    txs.unshift({
      id: uid(),
      type: "income",
      category: "income",
      name: "Income",
      amount: income,
      date: `${monthKey}-01`,
    });
  }

  return { monthKey, income, items, txs, inflows, assets, debts, targets };
}

function median(nums: number[]) {
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid]! : roundMoney((s[mid - 1]! + s[mid]!) / 2);
}

function detectRecurring(months: { monthKey: string; items: BudgetItem[] }[]): RecurringExpense[] {
  const map = new Map<string, { name: string; category: CategoryId; amounts: number[]; first: string }>();
  for (const m of months) {
    for (const it of m.items) {
      const key = `${it.category}::${it.name.trim().toLowerCase()}`;
      const cur = map.get(key);
      if (!cur) map.set(key, { name: it.name.trim(), category: it.category, amounts: [it.amount], first: m.monthKey });
      else cur.amounts.push(it.amount);
    }
  }
  const minHits = Math.max(4, Math.min(8, Math.floor(months.length / 4)));
  const out: RecurringExpense[] = [];
  const last = months[months.length - 1]?.monthKey;
  const start = last ? nextMonthKey(last) : currentMonthKey();
  for (const rec of map.values()) {
    if (rec.amounts.length < minHits) continue;
    const med = median(rec.amounts);
    if (med <= 0) continue;
    const stable = rec.amounts.filter((a) => Math.abs(a - med) / med < 0.35).length;
    if (stable < minHits) continue;
    out.push({
      id: uid(),
      name: rec.name,
      amount: med,
      category: rec.category,
      frequency: "monthly",
      startMonth: start,
      active: true,
    });
  }
  return out.slice(0, 24);
}

export async function workbookToAoa(data: ArrayBuffer | Uint8Array): Promise<{ name: string; rows: unknown[][] }[]> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(data, { type: "array", cellDates: false, raw: true });
  return wb.SheetNames.map((name) => ({
    name,
    rows: XLSX.utils.sheet_to_json(wb.Sheets[name]!, { header: 1, raw: true, defval: null }) as unknown[][],
  }));
}

export async function importBudgetWorkbook(
  data: ArrayBuffer | Uint8Array,
  opts?: { until?: string; profileName?: string },
): Promise<ImportResult> {
  const until = opts?.until ?? currentMonthKey();
  const sheets = await workbookToAoa(data);
  const skippedSheets: string[] = [];
  const warnings: string[] = [];
  const months: {
    monthKey: string;
    income: number;
    items: BudgetItem[];
    txs: Transaction[];
    inflows: { name: string; amount: number }[];
    assets: Partial<Profile["assets"]>;
    debts: { name: string; balance: number }[];
    targets: Partial<Record<CategoryId, number>> | null;
  }[] = [];

  for (const sh of sheets) {
    const parsed = parseMonthSheet(sh.name, sh.rows, until);
    if (!parsed) {
      if (SKIP_SHEET.test(sh.name) || !monthKeyFromSheetName(sh.name)) skippedSheets.push(sh.name);
      continue;
    }
    months.push(parsed);
  }

  months.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  if (months.length === 0) {
    throw new Error("no-months");
  }

  const monthMap: Record<string, MonthData> = {};
  const transactions: Transaction[] = [];
  const inflowAgg = new Map<string, { name: string; amounts: number[] }>();
  let latestAssets: Profile["assets"] = {
    cash: 0,
    bank: 0,
    savings: 0,
    investments: 0,
    property: 0,
    other: 0,
  };
  let assetsFound = false;
  let latestDebts: { name: string; balance: number }[] = [];

  for (const m of months) {
    monthMap[m.monthKey] = {
      ...emptyMonth(),
      income: m.income,
      items: m.items,
    };
    transactions.push(...m.txs);
    for (const inf of m.inflows) {
      const key = inf.name.trim().toLowerCase();
      const cur = inflowAgg.get(key);
      if (!cur) inflowAgg.set(key, { name: inf.name.trim(), amounts: [inf.amount] });
      else cur.amounts.push(inf.amount);
    }
    if (Object.keys(m.assets).length) {
      latestAssets = { ...latestAssets, ...m.assets };
      assetsFound = true;
    }
    if (m.debts.length) latestDebts = m.debts;
  }

  const last = months[months.length - 1]!;
  const split = last.targets ?? { essential: 80, investing: 10, flexible: 10 };
  const percents: Record<AllocKey, number> = {
    essential: Math.min(95, Math.max(20, split.essential || 80)),
    investing: Math.min(60, Math.max(0, split.investing || 10)),
    flexible: Math.min(40, Math.max(0, split.flexible || 10)),
    savings: 0,
    debt: 0,
  };
  const psum = percents.essential + percents.investing + percents.flexible;
  if (psum > 100) {
    const scale = 100 / psum;
    percents.essential = roundMoney(percents.essential * scale);
    percents.investing = roundMoney(percents.investing * scale);
    percents.flexible = roundMoney(100 - percents.essential - percents.investing);
  }

  const lastMonth = last.monthKey;
  const inflows: ExtraInflow[] = [...inflowAgg.values()].map((inf) => ({
    id: uid(),
    name: inf.name,
    amount: median(inf.amounts),
    category: "investing" as const,
    recurring: inf.amounts.length >= 2,
    frequency: "monthly" as const,
    startMonth: lastMonth,
    active: inf.amounts.length >= 2,
  }));

  const recurring = detectRecurring(months);
  const emergency = latestAssets.savings;
  const profile: Profile = {
    id: uid(),
    name: opts?.profileName ?? "Imported",
    paymentMethods: [
      { id: uid(), name: "Cash", color: "#22c55e", type: "cash" },
      { id: uid(), name: "Bank", color: "#0ea5e9", type: "bank" },
      { id: uid(), name: "eToro Visa", color: "#0b0b0f", type: "broker-card" },
    ],
    months: monthMap,
    goals:
      emergency > 0
        ? [{ id: "goal-emergency", name: "Emergency Fund", target: Math.max(emergency, 6000), current: emergency }]
        : [],
    debts: latestDebts.map((d) => ({
      id: uid(),
      name: d.name,
      balance: d.balance,
      ratePct: 0,
      minPayment: roundMoney(d.balance * 0.03),
      category: "essential" as const,
    })),
    largePurchases: [],
    recurring,
    recurringMemory: recurring.map((r) => ({ name: r.name, amount: r.amount, category: r.category })),
    inflows,
    transactions,
    assets: latestAssets,
    percents,
    adjustments: { essential: 0, flexible: 0, investing: 0, savings: 0, debt: 0 },
    debtMethod: "avalanche",
    extraDebtPayment: 0,
    aiTip: "",
  };

  if (months.length < 3) warnings.push("few-months");

  return {
    profile,
    summary: {
      months: months.length,
      items: months.reduce((s, m) => s + m.items.length, 0),
      firstMonth: months[0]?.monthKey ?? null,
      lastMonth: lastMonth,
      recurring: recurring.length,
      inflows: inflows.length,
      assetsFound,
      skippedSheets,
      warnings,
    },
  };
}

export async function readSpreadsheetFile(file: File): Promise<ArrayBuffer> {
  return file.arrayBuffer();
}

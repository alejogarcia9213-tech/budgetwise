import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { _ as createRootRoute, d as useRouterState, g as createFileRoute, h as lazyRouteComponent, l as Scripts, m as Outlet, p as createRouter, u as HeadContent, v as Link, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as string, i as object, n as literal, o as union, r as number } from "../_libs/zod.mjs";
import { A as prevMonthKey, B as yearOf, C as kvSet, E as monthNames, I as uid, L as useAppStore, N as t, O as monthTitle, S as kvGet, T as monthKeyFromParts, j as roundMoney, k as nextMonthKey, l as currentMonthKey, p as emptyMonth, s as cn, z as useProfile } from "./store-DJ-NhLM1.mjs";
import { t as Button } from "./button-BfLOEi7q.mjs";
import { C as LayoutDashboard, E as FileSpreadsheet, F as ArrowLeftRight, M as ChartLine, N as CalendarDays, O as ChevronRight, P as Calculator, d as Sparkles, k as ChevronLeft, l as Trash2, o as TriangleAlert, p as Settings, t as X, x as Menu } from "../_libs/lucide-react.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { n as utils, t as readSync } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/backup-CAYfPXBZ.js
var UNDO_BACKUP_KEY = "budgetwise-preimport-backup";
function buildBackup(input) {
	return {
		schemaVersion: 2,
		exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
		app: "budget-wise",
		...input
	};
}
function parseBackup(raw) {
	try {
		const data = JSON.parse(raw);
		if (!data || data.app !== "budget-wise") return {
			ok: false,
			error: "not-budget-wise"
		};
		if (!Array.isArray(data.profiles) || data.profiles.length === 0) return {
			ok: false,
			error: "empty"
		};
		return {
			ok: true,
			data
		};
	} catch {
		return {
			ok: false,
			error: "invalid"
		};
	}
}
function downloadBlob(filename, content, type) {
	const blob = new Blob([content], { type });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
function csvEscape(value) {
	const s = String(value);
	if (/[",\n]/.test(s)) return `"${s.replaceAll("\"", "\"\"")}"`;
	return s;
}
async function saveUndoBackup(json) {
	await kvSet(UNDO_BACKUP_KEY, json);
}
async function loadUndoBackup() {
	return kvGet(UNDO_BACKUP_KEY);
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/router-DZfxSB0e.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: error.message || "An unexpected error occurred. Try reloading the page."
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	if (typeof window === "undefined") return () => {};
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	const parentOrigin = resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		if (envelope.data.type === "hello") {
			if (!HelloSchema.safeParse(event.data).success) return;
			announce();
			return;
		}
		if (envelope.data.type === "navigate") {
			const parsed = NavigateSchema.safeParse(event.data);
			if (!parsed.success) return;
			navigate(parsed.data.path);
			queueMicrotask(reportLocation);
			return;
		}
		if (envelope.data.type === "history") {
			const parsed = HistorySchema.safeParse(event.data);
			if (!parsed.success) return;
			if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
			window.history.go(parsed.data.delta);
		}
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
/** In-app mark uses the published photographic icon so sidebar = home screen. */
function LogoMark({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/icon-192.png",
		alt: "",
		width: 36,
		height: 36,
		draggable: false,
		"aria-hidden": "true",
		className: cn("rounded-[22%] object-cover", className)
	});
}
function Logo({ compact }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: compact ? "size-8" : "size-9" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "leading-none",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: cn("font-semibold tracking-tight text-fg", compact ? "text-base" : "text-lg"),
				children: "Budget Wise"
			}), compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-muted",
				children: "Local finance"
			})]
		})]
	});
}
var MONTH_INDEX = {
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
	diciembre: 12
};
var SKIP_SHEET = /simulacro|cashflow|hoja\s*\d|template|plantilla/i;
var SKIP_NAME = /^(restante|total|assets|liabilities|balance|cashflow|patrimonio|balance\/patrimonio|income amount:?|spend on|ratio\b|r[uü]rup|saveback|inversiones|kindergeld)$/i;
var INFLOW_NAME = /popular investor|cashback|kindergeld|luna serena/i;
var SECTION = /^(assets|liabilities|activos|pasivos|balance|cashflow|ratio\b)/i;
function fold(s) {
	return s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}
function monthKeyFromSheetName(name) {
	if (SKIP_SHEET.test(name)) return null;
	const m = fold(name).replace(/[_./]+/g, " ").match(/([a-z]+)\s+(20\d{2})/);
	if (!m) return null;
	const month = MONTH_INDEX[m[1] ?? ""];
	if (!month) return null;
	return `${m[2]}-${String(month).padStart(2, "0")}`;
}
function toNumber(raw) {
	if (typeof raw === "number" && Number.isFinite(raw)) return raw;
	if (typeof raw !== "string") return null;
	const s = raw.trim().replace(/\s/g, "").replace(",", ".");
	if (!s || !/^-?\d+(\.\d+)?$/.test(s)) return null;
	const n = Number(s);
	return Number.isFinite(n) ? n : null;
}
function cellStr(raw) {
	if (raw == null) return "";
	if (typeof raw === "string") return raw.trim();
	if (typeof raw === "number") return String(raw);
	return String(raw).trim();
}
function isSkipName(name) {
	const n = fold(name);
	if (!n) return true;
	if (SKIP_NAME.test(n)) return true;
	if (n.startsWith("ratio ")) return true;
	if (n.includes("pendiente por repagar")) return true;
	return false;
}
function mapAssetKey(label) {
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
function findIncome(rows) {
	for (const row of rows.slice(0, 8)) for (let i = 0; i < row.length; i++) if (/income amount/i.test(cellStr(row[i]))) for (let j = i + 1; j < row.length; j++) {
		const n = toNumber(row[j]);
		if (n != null && n > 0) return roundMoney(n);
	}
	return 0;
}
function findTargets(rows, pairs, income) {
	if (income <= 0) return null;
	for (let r = 2; r < 6; r++) {
		const row = rows[r] ?? [];
		if (pairs.map((p) => toNumber(row[p.amt])).filter((n) => n != null && n > 0).length < 2) continue;
		const out = {};
		for (const p of pairs) {
			const n = toNumber(row[p.amt]);
			if (n != null && n > 0) out[p.cat] = roundMoney(n / income * 100);
		}
		return out;
	}
	return null;
}
function findPairCols(rows) {
	const header = rows.find((r) => r.some((c) => /spend on/i.test(cellStr(c)))) ?? [];
	const cols = [];
	for (let i = 0; i < header.length; i++) {
		const h = fold(cellStr(header[i]));
		if (!h) continue;
		if (/need/.test(h)) cols.push({
			amt: i,
			name: i + 1,
			cat: "essential"
		});
		else if (/invest/.test(h)) cols.push({
			amt: i,
			name: i + 1,
			cat: "investing"
		});
		else if (/want/.test(h)) cols.push({
			amt: i,
			name: i + 1,
			cat: "flexible"
		});
	}
	if (cols.length === 0) return [
		{
			amt: 0,
			name: 1,
			cat: "essential"
		},
		{
			amt: 2,
			name: 3,
			cat: "investing"
		},
		{
			amt: 4,
			name: 5,
			cat: "flexible"
		}
	];
	return cols;
}
function addItem(items, txs, monthKey, name, amount, category, day) {
	const amt = roundMoney(Math.abs(amount));
	if (amt <= 0) return;
	const existing = items.find((it) => it.category === category && it.name.trim().toLowerCase() === name.trim().toLowerCase());
	if (existing) {
		existing.amount = roundMoney(existing.amount + amt);
		const tx = txs.find((t) => t.itemId === existing.id);
		if (tx) tx.amount = existing.amount;
		return;
	}
	const id = uid();
	items.push({
		id,
		name: name.trim(),
		amount: amt,
		category
	});
	txs.push({
		id: uid(),
		type: category === "investing" ? "investment" : "expense",
		category,
		name: name.trim(),
		amount: amt,
		date: `${monthKey}-${String(Math.min(28, Math.max(1, day))).padStart(2, "0")}`,
		itemId: id
	});
}
function parseMonthSheet(name, rows, until) {
	const monthKey = monthKeyFromSheetName(name);
	if (!monthKey || monthKey > until) return null;
	const income = findIncome(rows);
	const pairs = findPairCols(rows);
	const targets = findTargets(rows, pairs, income);
	const items = [];
	const txs = [];
	const inflows = [];
	const assets = {};
	const debts = [];
	let section = "none";
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
			if (label && val != null && val > 0 && !SECTION.test(label)) debts.push({
				name: label,
				balance: roundMoney(val)
			});
			continue;
		}
		for (const col of pairs) {
			const amount = toNumber(row[col.amt]);
			const label = cellStr(row[col.name]);
			if (amount == null || !label || isSkipName(label)) continue;
			if (INFLOW_NAME.test(label) || amount < 0) {
				if (INFLOW_NAME.test(label) && Math.abs(amount) >= 20) inflows.push({
					name: label,
					amount: roundMoney(Math.abs(amount))
				});
				continue;
			}
			addItem(items, txs, monthKey, label, amount, col.cat, day++);
		}
		for (let i = 6; i + 1 < row.length; i += 2) {
			const amount = toNumber(row[i]);
			const label = cellStr(row[i + 1]);
			if (amount == null || amount <= 0 || !label || isSkipName(label)) continue;
			if (INFLOW_NAME.test(label) || /ingresos negocios/i.test(label)) inflows.push({
				name: label,
				amount: roundMoney(amount)
			});
		}
	}
	if (income > 0) txs.unshift({
		id: uid(),
		type: "income",
		category: "income",
		name: "Income",
		amount: income,
		date: `${monthKey}-01`
	});
	return {
		monthKey,
		income,
		items,
		txs,
		inflows,
		assets,
		debts,
		targets
	};
}
function median(nums) {
	const s = [...nums].sort((a, b) => a - b);
	const mid = Math.floor(s.length / 2);
	return s.length % 2 ? s[mid] : roundMoney((s[mid - 1] + s[mid]) / 2);
}
function detectRecurring(months) {
	const map = /* @__PURE__ */ new Map();
	for (const m of months) for (const it of m.items) {
		const key = `${it.category}::${it.name.trim().toLowerCase()}`;
		const cur = map.get(key);
		if (!cur) map.set(key, {
			name: it.name.trim(),
			category: it.category,
			amounts: [it.amount],
			first: m.monthKey
		});
		else cur.amounts.push(it.amount);
	}
	const minHits = Math.max(4, Math.min(8, Math.floor(months.length / 4)));
	const out = [];
	const last = months[months.length - 1]?.monthKey;
	const start = last ? nextMonthKey(last) : currentMonthKey();
	for (const rec of map.values()) {
		if (rec.amounts.length < minHits) continue;
		const med = median(rec.amounts);
		if (med <= 0) continue;
		if (rec.amounts.filter((a) => Math.abs(a - med) / med < .35).length < minHits) continue;
		out.push({
			id: uid(),
			name: rec.name,
			amount: med,
			category: rec.category,
			frequency: "monthly",
			startMonth: start,
			active: true
		});
	}
	return out.slice(0, 24);
}
function workbookToAoa(data) {
	const wb = readSync(data, {
		type: "array",
		cellDates: false,
		raw: true
	});
	return wb.SheetNames.map((name) => ({
		name,
		rows: utils.sheet_to_json(wb.Sheets[name], {
			header: 1,
			raw: true,
			defval: null
		})
	}));
}
function importBudgetWorkbook(data, opts) {
	const until = opts?.until ?? currentMonthKey();
	const sheets = workbookToAoa(data);
	const skippedSheets = [];
	const warnings = [];
	const months = [];
	for (const sh of sheets) {
		const parsed = parseMonthSheet(sh.name, sh.rows, until);
		if (!parsed) {
			if (SKIP_SHEET.test(sh.name) || !monthKeyFromSheetName(sh.name)) skippedSheets.push(sh.name);
			continue;
		}
		months.push(parsed);
	}
	months.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
	if (months.length === 0) throw new Error("no-months");
	const monthMap = {};
	const transactions = [];
	const inflowAgg = /* @__PURE__ */ new Map();
	let latestAssets = {
		cash: 0,
		bank: 0,
		savings: 0,
		investments: 0,
		property: 0,
		other: 0
	};
	let assetsFound = false;
	let latestDebts = [];
	for (const m of months) {
		monthMap[m.monthKey] = {
			...emptyMonth(),
			income: m.income,
			items: m.items
		};
		transactions.push(...m.txs);
		for (const inf of m.inflows) {
			const key = inf.name.trim().toLowerCase();
			const cur = inflowAgg.get(key);
			if (!cur) inflowAgg.set(key, {
				name: inf.name.trim(),
				amounts: [inf.amount]
			});
			else cur.amounts.push(inf.amount);
		}
		if (Object.keys(m.assets).length) {
			latestAssets = {
				...latestAssets,
				...m.assets
			};
			assetsFound = true;
		}
		if (m.debts.length) latestDebts = m.debts;
	}
	const last = months[months.length - 1];
	const split = last.targets ?? {
		essential: 80,
		investing: 10,
		flexible: 10
	};
	const percents = {
		essential: Math.min(95, Math.max(20, split.essential || 80)),
		investing: Math.min(60, Math.max(0, split.investing || 10)),
		flexible: Math.min(40, Math.max(0, split.flexible || 10)),
		savings: 0,
		debt: 0
	};
	const psum = percents.essential + percents.investing + percents.flexible;
	if (psum > 100) {
		const scale = 100 / psum;
		percents.essential = roundMoney(percents.essential * scale);
		percents.investing = roundMoney(percents.investing * scale);
		percents.flexible = roundMoney(100 - percents.essential - percents.investing);
	}
	const lastMonth = last.monthKey;
	const inflows = [...inflowAgg.values()].map((inf) => ({
		id: uid(),
		name: inf.name,
		amount: median(inf.amounts),
		category: "investing",
		recurring: inf.amounts.length >= 2,
		frequency: "monthly",
		startMonth: nextMonthKey(lastMonth),
		active: inf.amounts.length >= 2
	}));
	const recurring = detectRecurring(months);
	const emergency = latestAssets.savings;
	const profile = {
		id: uid(),
		name: opts?.profileName ?? "Imported",
		paymentMethods: [
			{
				id: uid(),
				name: "Cash",
				color: "#22c55e",
				type: "cash"
			},
			{
				id: uid(),
				name: "Bank",
				color: "#0ea5e9",
				type: "bank"
			},
			{
				id: uid(),
				name: "eToro Visa",
				color: "#0b0b0f",
				type: "broker-card"
			}
		],
		months: monthMap,
		goals: emergency > 0 ? [{
			id: "goal-emergency",
			name: "Emergency Fund",
			target: Math.max(emergency, 6e3),
			current: emergency
		}] : [],
		debts: latestDebts.map((d) => ({
			id: uid(),
			name: d.name,
			balance: d.balance,
			ratePct: 0,
			minPayment: roundMoney(d.balance * .03),
			category: "essential"
		})),
		largePurchases: [],
		recurring,
		recurringMemory: recurring.map((r) => ({
			name: r.name,
			amount: r.amount,
			category: r.category
		})),
		inflows,
		transactions,
		assets: latestAssets,
		percents,
		adjustments: {
			essential: 0,
			flexible: 0,
			investing: 0,
			savings: 0,
			debt: 0
		},
		debtMethod: "avalanche",
		extraDebtPayment: 0,
		aiTip: ""
	};
	if (months.length < 3) warnings.push("few-months");
	return {
		profile,
		summary: {
			months: months.length,
			items: months.reduce((s, m) => s + m.items.length, 0),
			firstMonth: months[0]?.monthKey ?? null,
			lastMonth,
			recurring: recurring.length,
			inflows: inflows.length,
			assetsFound,
			skippedSheets,
			warnings
		}
	};
}
async function snapshotCurrent() {
	const s = useAppStore.getState();
	const backup = buildBackup({
		profiles: s.profiles,
		lang: s.lang,
		theme: s.theme,
		currency: s.currency,
		advancedView: s.advancedView,
		activeMonth: s.activeMonth,
		activeProfileId: s.activeProfileId,
		calc: s.calc
	});
	const json = JSON.stringify(backup);
	await saveUndoBackup(json);
	downloadBlob(`budget-wise-backup-before-import.json`, json, "application/json");
	useAppStore.getState().setHasUndoImport(true);
}
async function applySpreadsheet(file) {
	const buf = await file.arrayBuffer();
	const until = currentMonthKey();
	const { profile, summary } = importBudgetWorkbook(buf, {
		until,
		profileName: useAppStore.getState().profiles.find((p) => p.id === useAppStore.getState().activeProfileId)?.name ?? "Main"
	});
	const s = useAppStore.getState();
	profile.id = s.activeProfileId;
	await snapshotCurrent();
	s.importProfiles(s.profiles.map((p) => p.id === profile.id ? profile : p), {
		activeMonth: summary.lastMonth ?? until,
		activeProfileId: profile.id
	});
	s.setSetupComplete(true);
	return summary;
}
async function restoreUndoImport() {
	const raw = await loadUndoBackup();
	if (!raw) return false;
	const parsed = parseBackup(raw);
	if (!parsed.ok) return false;
	useAppStore.getState().importProfiles(parsed.data.profiles, {
		lang: parsed.data.lang,
		theme: parsed.data.theme,
		currency: parsed.data.currency,
		advancedView: parsed.data.advancedView,
		activeMonth: parsed.data.activeMonth,
		activeProfileId: parsed.data.activeProfileId
	});
	return true;
}
function SpreadsheetImportButtons({ compact = false }) {
	const lang = useAppStore((s) => s.lang);
	const hasUndo = useAppStore((s) => s.hasUndoImport);
	const fileRef = (0, import_react.useRef)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function onFile(file) {
		setBusy(true);
		try {
			const summary = await applySpreadsheet(file);
			toast.success(t(lang, "import.ok", {
				months: summary.months,
				first: summary.firstMonth ?? "",
				last: summary.lastMonth ?? ""
			}));
		} catch {
			toast.error(t(lang, "import.bad"));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: ".xlsx,.xls,.csv,.ods,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv",
				className: "hidden",
				onChange: (e) => {
					const f = e.target.files?.[0];
					if (f) onFile(f);
					e.target.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: compact ? "secondary" : "default",
				className: "w-full",
				disabled: busy,
				onClick: () => fileRef.current?.click(),
				children: busy ? t(lang, "import.working") : t(lang, "import.excel")
			}),
			hasUndo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "w-full",
				onClick: async () => {
					const ok = await restoreUndoImport();
					toast[ok ? "success" : "error"](t(lang, ok ? "import.restoreOk" : "import.bad"));
				},
				children: t(lang, "import.restore")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: t(lang, "import.excelHint")
			})
		]
	});
}
function SetupGate() {
	const lang = useAppStore((s) => s.lang);
	const complete = useAppStore((s) => s.setupComplete);
	if (!useAppStore((s) => s.hydrated) || complete) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] flex items-end justify-center bg-bg/80 p-4 md:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-2xl bg-card p-5 card-shadow md:p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 text-xl font-semibold tracking-tight",
					children: t(lang, "setup.title")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: t(lang, "setup.subtitle")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-start gap-3 rounded-xl bg-elevated p-3 text-left hover:bg-elevated/80",
							onClick: () => useAppStore.getState().setSetupComplete(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "mt-0.5 size-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium",
								children: t(lang, "setup.sample")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-xs text-muted",
								children: t(lang, "setup.sampleHint")
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "flex w-full items-start gap-3 rounded-xl bg-elevated p-3 text-left hover:bg-elevated/80",
							onClick: () => {
								useAppStore.getState().resetProfile();
								useAppStore.getState().setSetupComplete(true);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mt-0.5 size-5 shrink-0 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-medium",
								children: t(lang, "setup.empty")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-xs text-muted",
								children: t(lang, "setup.emptyHint")
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl bg-elevated p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center gap-2 text-sm font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "size-5 text-primary" }), t(lang, "setup.upload")]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-3 text-xs text-muted",
									children: t(lang, "setup.uploadHint")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpreadsheetImportButtons, { compact: true })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							className: "w-full",
							onClick: () => useAppStore.getState().setSetupComplete(true),
							children: t(lang, "setup.skip")
						})
					]
				})
			]
		})
	});
}
function MonthPicker({ compact = false }) {
	const lang = useAppStore((s) => s.lang);
	const month = useAppStore((s) => s.activeMonth);
	const setMonth = useAppStore((s) => s.setMonth);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [year, setYear] = (0, import_react.useState)(() => Number(yearOf(month)));
	const rootRef = (0, import_react.useRef)(null);
	const names = monthNames(lang);
	const selectedMonth = Number(month.slice(5));
	(0, import_react.useEffect)(() => {
		setYear(Number(yearOf(month)));
	}, [month]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onDoc = (e) => {
			if (!rootRef.current?.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: rootRef,
		className: "relative min-w-0 flex-1",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-11 shrink-0 items-center justify-center rounded-md bg-elevated text-fg hover:bg-card",
					"aria-label": t(lang, "cal.prev"),
					onClick: () => setMonth(prevMonthKey(month)),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "flex h-11 min-w-0 flex-1 items-center justify-center gap-2 rounded-md bg-elevated px-3 text-sm font-medium card-shadow",
					"aria-haspopup": "dialog",
					"aria-expanded": open,
					onClick: () => setOpen((v) => !v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "size-4 shrink-0 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate",
						children: monthTitle(month, lang)
					})]
				}),
				compact ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "flex size-11 shrink-0 items-center justify-center rounded-md bg-elevated text-fg hover:bg-card",
					"aria-label": t(lang, "cal.next"),
					onClick: () => setMonth(nextMonthKey(month)),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-5" })
				})
			]
		}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-label": t(lang, "budget.pickPeriod"),
			className: "absolute top-[calc(100%+0.5rem)] left-0 z-40 w-full rounded-xl bg-card p-3 card-shadow",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-3 flex items-center justify-between",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-10 items-center justify-center rounded-md hover:bg-elevated",
						"aria-label": t(lang, "budget.prevYear"),
						onClick: () => setYear((y) => y - 1),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold tabular",
						children: year
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "flex size-10 items-center justify-center rounded-md hover:bg-elevated",
						"aria-label": t(lang, "budget.nextYear"),
						onClick: () => setYear((y) => y + 1),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4" })
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-3 gap-1.5",
				children: names.map((label, i) => {
					const m = i + 1;
					const key = monthKeyFromParts(year, m);
					const selected = year === Number(yearOf(month)) && m === selectedMonth;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: cn("h-11 rounded-md text-sm font-medium", selected ? "bg-primary text-primary-fg" : "bg-elevated text-fg hover:bg-card"),
						onClick: () => {
							setMonth(key);
							setOpen(false);
						},
						children: label
					}, key);
				})
			})]
		}) : null]
	});
}
function PeriodBar() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthPicker, {});
}
var MAIN_NAV = [
	{
		to: "/",
		key: "nav.dashboard",
		icon: LayoutDashboard
	},
	{
		to: "/transactions",
		key: "nav.transactions",
		icon: ArrowLeftRight
	},
	{
		to: "/calendar",
		key: "nav.calendar",
		icon: CalendarDays
	}
];
var MORE_NAV = [
	{
		to: "/calculator",
		key: "nav.calculator",
		icon: Calculator
	},
	{
		to: "/reports",
		key: "nav.reports",
		icon: ChartLine
	},
	{
		to: "/settings",
		key: "nav.settings",
		icon: Settings
	}
];
function AppShell({ children }) {
	const lang = useAppStore((s) => s.lang);
	const theme = useAppStore((s) => s.theme);
	const hydrated = useAppStore((s) => s.hydrated);
	const setHydrated = useAppStore((s) => s.setHydrated);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const [more, setMore] = (0, import_react.useState)(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		Promise.resolve(useAppStore.persist.rehydrate()).finally(() => setHydrated(true));
	}, [setHydrated]);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		useAppStore.getState().applyAutosForMonth(month);
	}, [
		hydrated,
		month,
		profile.id
	]);
	(0, import_react.useEffect)(() => {
		const root = document.documentElement;
		root.lang = lang;
		root.classList.toggle("light", theme === "light");
		root.classList.toggle("dark", theme === "dark");
	}, [lang, theme]);
	(0, import_react.useEffect)(() => {
		document.body.style.overflow = more ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [more]);
	const moreActive = MORE_NAV.some((item) => pathname.startsWith(item.to));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-surface px-3 py-4 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "px-2 pb-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							"aria-label": t(lang, "appName"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Logo, {})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-1 flex-col gap-1",
						children: [...MAIN_NAV, ...MORE_NAV].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SideLink, {
							to: item.to,
							label: t(lang, item.key),
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-4" }),
							active: item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)
						}, item.to))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-3 pt-4 text-xs text-subtle",
						children: profile.name
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-md md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						"aria-label": t(lang, "appName"),
						className: "shrink-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogoMark, { className: "size-8" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthPicker, { compact: true })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:pl-60",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto hidden w-full max-w-5xl items-center px-8 pt-6 md:grid md:grid-cols-[1fr_auto_1fr]",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-[min(100%,20rem)]",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PeriodBar, {})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "justify-self-end text-sm text-muted",
								children: profile.name
							})
						]
					}),
					more ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "fixed inset-0 z-50 md:hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "absolute inset-0 bg-bg/70",
							"aria-label": t(lang, "common.close"),
							onClick: () => setMore(false)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
							className: "absolute right-0 bottom-0 left-0 flex max-h-[min(28rem,80dvh)] flex-col gap-1 rounded-t-2xl bg-surface px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] card-shadow sheet-in",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mx-auto mb-2 h-1 w-10 rounded-full bg-border",
									"aria-hidden": true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-2 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-base font-semibold",
										children: t(lang, "nav.more")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "flex size-11 items-center justify-center rounded-md text-muted hover:bg-elevated",
										onClick: () => setMore(false),
										"aria-label": t(lang, "common.close"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
									})]
								}),
								MORE_NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									onClick: () => setMore(false),
									className: cn("flex min-h-14 items-center gap-3 rounded-md px-3 text-base font-medium", pathname.startsWith(item.to) ? "bg-primary text-primary-fg" : "text-fg hover:bg-elevated"),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5" }), t(lang, item.key)]
								}, item.to))
							]
						})]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto w-full max-w-5xl px-3 pt-3 pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:px-8 md:pt-4 md:pb-12",
						children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "py-8 text-center text-xs text-subtle",
							children: t(lang, "byline")
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "grid grid-cols-4",
					children: [MAIN_NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabLink, {
						to: item.to,
						label: t(lang, item.key),
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "size-5" }),
						active: item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)
					}) }, item.to)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setMore(true),
						className: cn("flex h-14 w-full flex-col items-center justify-center gap-0.5 px-1 text-[0.7rem] leading-tight font-medium", more || moreActive ? "text-primary" : "text-muted"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "max-w-full truncate",
							children: t(lang, "nav.more")
						})]
					}) })]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
				theme,
				position: "top-center"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SetupGate, {})
		]
	});
}
function SideLink({ to, label, icon, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: cn("flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium", active ? "bg-primary text-primary-fg" : "text-muted hover:bg-elevated hover:text-fg"),
		children: [icon, label]
	});
}
function TabLink({ to, label, icon, active }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		className: cn("flex h-14 flex-col items-center justify-center gap-0.5 px-1 text-[0.7rem] leading-tight font-medium", active ? "text-primary" : "text-muted"),
		children: [icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "max-w-full truncate",
			children: label
		})]
	});
}
var styles_default = "/assets/styles-DrrycZi8.css";
var APP_NAME = "Budget Wise";
var Route$8 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: "See where every euro goes. Local-first personal budgeting."
			},
			{
				name: "theme-color",
				content: "#0A0B12"
			},
			{
				name: "apple-mobile-web-app-title",
				content: APP_NAME
			},
			{
				name: "application-name",
				content: APP_NAME
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/icon-32.png"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,500&display=swap"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "dark antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	})
});
var $$splitComponentImporter$7 = () => import("./routes-6I9_Nw_1.mjs");
var Route$7 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./budget-yMmKFM6o.mjs");
var Route$6 = createFileRoute("/budget")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./calculator-Cn7EpuJZ.mjs");
var Route$5 = createFileRoute("/calculator")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./calendar-DN0UVtkC.mjs");
var Route$4 = createFileRoute("/calendar")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./planning-BNxm5LOa.mjs");
var Route$3 = createFileRoute("/planning")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./reports-CCrkvJSK.mjs");
var Route$2 = createFileRoute("/reports")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./settings-DozjPMby.mjs");
var Route$1 = createFileRoute("/settings")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./transactions-es_NRzhF.mjs");
var Route = createFileRoute("/transactions")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$7.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$8
	}),
	BudgetRoute: Route$6.update({
		id: "/budget",
		path: "/budget",
		getParentRoute: () => Route$8
	}),
	CalculatorRoute: Route$5.update({
		id: "/calculator",
		path: "/calculator",
		getParentRoute: () => Route$8
	}),
	CalendarRoute: Route$4.update({
		id: "/calendar",
		path: "/calendar",
		getParentRoute: () => Route$8
	}),
	PlanningRoute: Route$3.update({
		id: "/planning",
		path: "/planning",
		getParentRoute: () => Route$8
	}),
	ReportsRoute: Route$2.update({
		id: "/reports",
		path: "/reports",
		getParentRoute: () => Route$8
	}),
	SettingsRoute: Route$1.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => Route$8
	}),
	TransactionsRoute: Route.update({
		id: "/transactions",
		path: "/transactions",
		getParentRoute: () => Route$8
	})
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { downloadBlob as a, csvEscape as i, SpreadsheetImportButtons as n, parseBackup as o, buildBackup as r, router_exports as t };

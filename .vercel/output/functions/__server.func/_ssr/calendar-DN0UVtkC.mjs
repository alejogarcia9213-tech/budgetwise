import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { F as txsInMonth, L as useAppStore, M as startWeekday, N as t, P as txSigned, d as daysInMonth, g as formatMoney, h as formatDayTitle, s as cn, z as useProfile } from "./store-DJ-NhLM1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendar-DN0UVtkC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CalendarView() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const txs = txsInMonth(profile, month);
	const [day, setDay] = (0, import_react.useState)(null);
	const dim = daysInMonth(month);
	const start = startWeekday(month);
	const cells = (0, import_react.useMemo)(() => {
		const list = [];
		for (let i = 0; i < start; i++) list.push(null);
		for (let d = 1; d <= dim; d++) list.push(d);
		while (list.length % 7 !== 0) list.push(null);
		return list;
	}, [start, dim]);
	const byDay = (0, import_react.useMemo)(() => {
		const map = {};
		for (const tx of txs) (map[tx.date] ??= []).push(tx);
		return map;
	}, [txs]);
	const selected = day ? byDay[day] ?? [] : [];
	const income = txs.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
	const expenses = txs.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
	const saved = txs.filter((x) => x.type === "saving").reduce((s, x) => s + x.amount, 0);
	const invested = txs.filter((x) => x.type === "investment").reduce((s, x) => s + x.amount, 0);
	const weekdays = t(lang, "cal.weekdays").split(",");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: t(lang, "cal.title")
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-2xl bg-card p-3 card-shadow sm:p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-7 gap-1 text-center text-xs text-muted",
					children: [weekdays.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-1 font-medium",
						children: w
					}, `${w}-${i}`)), cells.map((d, i) => {
						if (d == null) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {}, `e-${i}`);
						const iso = `${month}-${String(d).padStart(2, "0")}`;
						const has = (byDay[iso] ?? []).length > 0;
						const active = day === iso;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setDay(iso),
							className: cn("relative flex h-11 items-center justify-center rounded-md text-sm", active ? "bg-primary text-primary-fg" : "hover:bg-elevated"),
							children: [d, has ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute bottom-1 size-1 rounded-full", active ? "bg-primary-fg" : "bg-primary") }) : null]
						}, iso);
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: t(lang, "cal.income"),
						value: formatMoney(income, currency, lang)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: t(lang, "cal.expenses"),
						value: formatMoney(expenses, currency, lang)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: t(lang, "cal.saved"),
						value: formatMoney(saved, currency, lang)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: t(lang, "cal.invested"),
						value: formatMoney(invested, currency, lang)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl bg-card p-5 card-shadow",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: day ? formatDayTitle(day, lang) : t(lang, "cal.title")
				}), !day ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: t(lang, "cal.emptyDay")
				}) : selected.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: t(lang, "cal.emptyDay")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 divide-y divide-border",
					children: selected.map((tx) => {
						const signed = txSigned(tx);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between py-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tx.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("tabular", signed >= 0 ? "text-success" : "text-fg"),
								children: [signed >= 0 ? "+" : "", formatMoney(signed, currency, lang)]
							})]
						}, tx.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					t(lang, "cal.net"),
					": ",
					formatMoney(income - expenses - saved - invested, currency, lang)
				]
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card p-3 card-shadow",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "tabular font-medium",
			children: value
		})]
	});
}
function CalendarPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarView, {});
}
//#endregion
export { CalendarPage as component };

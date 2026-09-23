import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { D as monthSnapshot, F as txsInMonth, L as useAppStore, N as t, O as monthTitle, g as formatMoney, z as useProfile } from "./store-DJ-NhLM1.mjs";
import { t as Button } from "./button-BfLOEi7q.mjs";
import { i as HealthCard, l as YearlyCard, o as MonthlySummary } from "./budget-cards-CgffNrRO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as downloadBlob, i as csvEscape, o as parseBackup, r as buildBackup } from "./router-DZfxSB0e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reports-CCrkvJSK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ReportsView() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const fileRef = (0, import_react.useRef)(null);
	const snap = monthSnapshot(profile, month);
	const txs = txsInMonth(profile, month).slice().sort((a, b) => b.amount - a.amount);
	const top = txs.slice(0, 8);
	function exportJson() {
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
		downloadBlob(`budget-wise-backup-${month}.json`, JSON.stringify(backup, null, 2), "application/json");
	}
	function exportCsv() {
		const rows = [[
			"date",
			"type",
			"category",
			"name",
			"amount",
			"method",
			"notes"
		].join(","), ...profile.transactions.map((tx) => [
			tx.date,
			tx.type,
			tx.category,
			csvEscape(tx.name),
			tx.amount,
			csvEscape(profile.paymentMethods.find((m) => m.id === tx.methodId)?.name ?? ""),
			csvEscape(tx.notes ?? "")
		].join(","))];
		downloadBlob(`budget-wise-transactions-${profile.name}.csv`, rows.join("\n"), "text/csv");
	}
	function onImport(file) {
		const reader = new FileReader();
		reader.onload = () => {
			const parsed = parseBackup(String(reader.result ?? ""));
			if (!parsed.ok) {
				toast.error(t(lang, "reports.importBad"));
				return;
			}
			if (!window.confirm(t(lang, "reports.confirmImport"))) return;
			useAppStore.getState().importProfiles(parsed.data.profiles, {
				lang: parsed.data.lang ?? void 0,
				theme: parsed.data.theme,
				currency: parsed.data.currency,
				advancedView: parsed.data.advancedView,
				activeMonth: parsed.data.activeMonth,
				activeProfileId: parsed.data.activeProfileId
			});
			toast.success(t(lang, "reports.importOk"));
		};
		reader.readAsText(file);
	}
	const methodTotals = profile.paymentMethods.map((m) => ({
		name: m.name,
		total: txs.filter((tx) => tx.methodId === m.id).reduce((s, tx) => s + tx.amount, 0)
	})).filter((m) => m.total > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: t(lang, "reports.title")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: t(lang, "reports.subtitle")
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "h-auto min-h-11 whitespace-normal px-2 py-2 text-center text-xs sm:text-sm",
						onClick: exportCsv,
						children: t(lang, "reports.exportCsv")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "h-auto min-h-11 whitespace-normal px-2 py-2 text-center text-xs sm:text-sm",
						onClick: exportJson,
						children: t(lang, "reports.exportJson")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "h-auto min-h-11 whitespace-normal px-2 py-2 text-center text-xs sm:text-sm",
						onClick: () => fileRef.current?.click(),
						children: t(lang, "reports.importJson")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						className: "h-auto min-h-11 whitespace-normal px-2 py-2 text-center text-xs sm:text-sm",
						onClick: () => window.print(),
						children: t(lang, "reports.print")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: "application/json",
				className: "hidden",
				onChange: (e) => {
					const f = e.target.files?.[0];
					if (f) onImport(f);
					e.target.value = "";
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-subtle",
				children: t(lang, "reports.backupHint")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-2xl bg-card p-5 card-shadow print:shadow-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-lg font-semibold",
						children: [
							t(lang, "reports.monthly"),
							" · ",
							monthTitle(month, lang)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-3xl font-semibold tabular",
						children: formatMoney(snap.income, currency, lang)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: t(lang, "budget.totalIncome")
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthlySummary, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl bg-card p-5 card-shadow",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: t(lang, "reports.topTx")
				}), top.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-6 text-center text-sm text-subtle",
					children: t(lang, "common.empty")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 divide-y divide-border",
					children: top.map((tx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tx.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular",
							children: formatMoney(tx.amount, currency, lang)
						})]
					}, tx.id))
				})]
			}),
			methodTotals.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-2xl bg-card p-5 card-shadow",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold",
					children: t(lang, "reports.byMethod")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 divide-y divide-border",
					children: methodTotals.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex justify-between py-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular",
							children: formatMoney(m.total, currency, lang)
						})]
					}, m.name))
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YearlyCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthCard, {})
		]
	});
}
function ReportsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportsView, {});
}
//#endregion
export { ReportsPage as component };

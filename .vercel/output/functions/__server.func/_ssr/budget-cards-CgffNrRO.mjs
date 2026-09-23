import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { n as createServerFn, r as getServerFnById, t as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { a as string, i as object, t as _enum } from "../_libs/zod.mjs";
import { D as monthSnapshot, L as useAppStore, N as t, O as monthTitle, R as useMonthData, V as yearRows, _ as formatPct, a as RECURRING_FREQS, b as isLargeActive, c as currencySymbol, f as displayItemsFor, g as formatMoney, m as extrasFor, n as FREQ_LABEL, s as cn, v as installmentOf, w as largeProgress, y as isDebtActive, z as useProfile } from "./store-DJ-NhLM1.mjs";
import { t as Button } from "./button-BfLOEi7q.mjs";
import { t as Label } from "./label-CXJ1augD.mjs";
import { n as Panel, r as Row, t as Fold } from "./panel-Btdc78ax.mjs";
import { D as CircleHelp, S as Lightbulb, _ as PiggyBank, c as TrendingDown, h as Plus, j as Check, l as Trash2, m as Repeat, n as Wallet, s as TrendingUp, t as X, v as Pencil } from "../_libs/lucide-react.mjs";
import { i as evalAmountExpr, n as Dialog, r as DialogContent, t as AmountExprInput } from "./dialog-CNqxeaFt.mjs";
import { t as Input } from "./input-BWhrm__Q.mjs";
import { t as NativeSelect } from "./native-select-D218FZZi.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, l as Pie, n as PieChart, r as BarChart, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/budget-cards-CgffNrRO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var schema = object({
	lang: _enum([
		"en",
		"es",
		"de",
		"it",
		"fr",
		"pt"
	]),
	snapshot: string().max(4e3)
});
var getAiTip = createServerFn({ method: "POST" }).validator((input) => schema.parse(input)).handler(createSsrRpc("1552f2a45c1a1aeb55bef4430ae10c7ee16c0bfb60a8208531133f6d91cc316b"));
function computeHealth(input) {
	const totalAssets = input.cash + input.bank + input.savings + input.investments + input.property + input.other;
	const totalLiabilities = input.debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
	const netWorth = totalAssets - totalLiabilities;
	const liquid = input.cash + input.bank + input.savings;
	const minDebtPay = input.debts.reduce((s, d) => s + Math.max(0, d.minPayment), 0);
	const liquidity = input.monthlyEssentials > 0 ? liquid / input.monthlyEssentials : liquid > 0 ? 99 : 0;
	const savInv = input.monthlyIncome > 0 ? (input.monthlySaved + input.monthlyInvested) / input.monthlyIncome * 100 : 0;
	const debtToAssets = totalAssets > 0 ? totalLiabilities / totalAssets * 100 : totalLiabilities > 0 ? 100 : 0;
	const monthlyDebt = input.monthlyIncome > 0 ? minDebtPay / input.monthlyIncome * 100 : 0;
	const investedNw = netWorth > 0 ? input.investments / netWorth * 100 : 0;
	const solvency = totalAssets > 0 ? netWorth / totalAssets * 100 : 0;
	return {
		totalAssets,
		totalLiabilities,
		netWorth,
		liquid,
		ratios: [
			{
				key: "liquidity",
				value: liquidity,
				display: liquidity.toFixed(2),
				healthy: liquidity >= 3,
				unit: "months"
			},
			{
				key: "savInvRate",
				value: savInv,
				display: savInv.toFixed(2),
				healthy: savInv >= 20,
				unit: "pct"
			},
			{
				key: "debtToAssets",
				value: debtToAssets,
				display: debtToAssets.toFixed(2),
				healthy: debtToAssets <= 40,
				unit: "pct"
			},
			{
				key: "monthlyDebt",
				value: monthlyDebt,
				display: monthlyDebt.toFixed(2),
				healthy: monthlyDebt <= 36,
				unit: "pct"
			},
			{
				key: "investedNw",
				value: investedNw,
				display: investedNw.toFixed(2),
				healthy: investedNw >= 50,
				unit: "pct"
			},
			{
				key: "solvency",
				value: solvency,
				display: solvency.toFixed(2),
				healthy: solvency >= 50,
				unit: "pct"
			}
		]
	};
}
var TIPS = [
	{
		id: "emergency",
		when: (s) => s.liquidityMonths < 3,
		en: "Your cash buffer covers less than three months of essentials. Park the next leftover euro in an emergency fund before adding new lifestyle spend.",
		es: "Tu colchón cubre menos de tres meses de gastos esenciales. Destina el siguiente euro libre al fondo de emergencia antes de aumentar el ocio."
	},
	{
		id: "over-allocate",
		when: (s) => s.leftToBudget < -1,
		en: "Planned allocations exceed this month's income. Lower a target percentage or trim an adjustment so every euro has a job without going over.",
		es: "Las asignaciones previstas superan los ingresos del mes. Baja un porcentaje o un ajuste para que cada euro tenga un propósito sin pasarte."
	},
	{
		id: "unallocated",
		when: (s) => s.leftToBudget > 20,
		en: "You still have money left to budget. Give it a job — debt extra, emergency fund, or the investment line — so it does not leak into impulse spend.",
		es: "Todavía te queda dinero por asignar. Dale un propósito: extra a deuda, fondo de emergencia o inversión, para que no se escape en impulsos."
	},
	{
		id: "flex-high",
		when: (s) => s.netIncome > 0 && s.flexibleExpenses / s.netIncome > .3,
		en: "Flexible spending is eating more than 30% of income. Pick one recurring treat to pause this month and move that amount to savings.",
		es: "El gasto flexible supera el 30% de tus ingresos. Elige un capricho recurrente para pausar este mes y mueve ese importe al ahorro."
	},
	{
		id: "save-rate",
		when: (s) => s.savingsInvestmentRate < 20 && s.netIncome > 0,
		en: "Your savings-investment rate is under 20%. Automate a transfer the day income lands so the rate does not depend on leftover willpower.",
		es: "Tu tasa de ahorro-inversión está por debajo del 20%. Automatiza una transferencia el día que cobra para no depender de la voluntad."
	},
	{
		id: "debt-first",
		when: (s) => s.debts > 0 && s.investments > 0 && s.savingsInvestmentRate > 0,
		en: "You are investing while carrying debt. Keep a small automated invest, then throw extra cash at the highest APR — interest saved is a guaranteed return.",
		es: "Estás invirtiendo con deudas. Mantén una inversión automática pequeña y lanza el extra a la APR más alta: el interés evitado es una rentabilidad segura."
	},
	{
		id: "debt-heavy",
		when: (s) => s.debts > 0 && s.netWorth < s.debts,
		en: "Liabilities outweigh assets. Freeze new borrowing and run avalanche or snowball until the snowball of freed minimums is working for you.",
		es: "Los pasivos superan a los activos. Congela nuevo crédito y usa avalancha o bola de nieve hasta que los mínimos liberados trabajen a tu favor."
	},
	{
		id: "invest-habit",
		when: (s) => s.investments === 0 && s.netIncome > 0 && s.leftover > 0,
		en: "Nothing is invested this month. Even a small ETF contribution turns leftover cash into a working asset instead of a larger checking balance.",
		es: "Este mes no hay inversión. Aunque sea una aportación pequeña a un ETF, convierte el sobrante en un activo que trabaja."
	},
	{
		id: "positive-nw",
		when: (s) => s.netWorth > 0 && s.savingsInvestmentRate >= 20 && s.liquidityMonths >= 3,
		en: "Liquidity, savings rate and net worth are all in a healthy range. Raise the investment contribution by 1% of income and leave it on autopilot.",
		es: "Liquidez, tasa de ahorro y patrimonio están en rango saludable. Sube la aportación a inversión un 1% de ingresos y déjala en piloto automático."
	},
	{
		id: "essentials-tight",
		when: (s) => s.netIncome > 0 && s.essentialExpenses / s.netIncome > .7,
		en: "Essentials are taking more than 70% of income. Review rent, utilities and groceries for one recurring cut — that is the fastest way to free a savings line.",
		es: "Lo esencial se lleva más del 70% de los ingresos. Revisa alquiler, suministros y comida para un recorte recurrente: es la vía más rápida para liberar ahorro."
	},
	{
		id: "leftover-cash",
		when: (s) => s.leftover > 50 && s.savings === 0,
		en: "The month still shows a cash surplus with no savings contribution. Sweep that leftover into your emergency fund before the next payday.",
		es: "El mes cierra con superávit y sin aportación a ahorro. Pasa ese resto al fondo de emergencia antes de la siguiente nómina."
	},
	{
		id: "on-track",
		when: () => true,
		en: "Keep recording every spend the day it happens. The budget is only as honest as the ledger — two minutes now prevents a surprise at month-end.",
		es: "Sigue anotando cada gasto el día que ocurre. El presupuesto solo es honesto si el libro lo es: dos minutos ahora evitan sorpresas a fin de mes."
	}
];
function generateFinancialTips(snapshot, excludeId) {
	return TIPS.filter((tip) => tip.id !== excludeId && tip.when(snapshot)).map(({ id, en, es }) => ({
		id,
		en,
		es
	}));
}
function pickTip(snapshot, excludeId) {
	const applicable = generateFinancialTips(snapshot, excludeId);
	const pool = applicable.length > 0 ? applicable : generateFinancialTips(snapshot);
	return pool[Math.floor(Math.random() * pool.length)] ?? {
		id: "on-track",
		en: TIPS[TIPS.length - 1].en,
		es: TIPS[TIPS.length - 1].es
	};
}
function HealthCard() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const snap = monthSnapshot(profile, month);
	const [hint, setHint] = (0, import_react.useState)(null);
	const health = computeHealth({
		...profile.assets,
		debts: profile.debts,
		monthlyEssentials: snap.essential || snap.targets.essential,
		monthlyIncome: snap.income,
		monthlySaved: snap.savings,
		monthlyInvested: snap.investing
	});
	const assetFields = [
		{
			key: "cash",
			label: t(lang, "budget.cash")
		},
		{
			key: "bank",
			label: t(lang, "budget.bank")
		},
		{
			key: "savings",
			label: t(lang, "budget.savings")
		},
		{
			key: "investments",
			label: t(lang, "budget.investments")
		},
		{
			key: "property",
			label: t(lang, "budget.property")
		},
		{
			key: "other",
			label: t(lang, "budget.other")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold",
			children: t(lang, "budget.health")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: t(lang, "budget.healthHint")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Fold, {
				title: t(lang, "budget.netWorth"),
				children: [
					assetFields.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "mb-0",
							children: f.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
							className: "h-11 w-full sm:w-32",
							value: profile.assets[f.key],
							onValue: (n) => useAppStore.getState().setAssets({ [f.key]: n })
						})]
					}, f.key)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: t(lang, "budget.assets"),
						value: formatMoney(health.totalAssets, currency, lang)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: t(lang, "budget.liabilities"),
						value: formatMoney(health.totalLiabilities, currency, lang),
						tone: "danger"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						label: t(lang, "budget.netWorthLabel"),
						value: formatMoney(health.netWorth, currency, lang)
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Fold, {
				title: t(lang, "budget.ratios"),
				defaultOpen: true,
				children: [health.ratios.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-h-11 items-center justify-between gap-2 border-b border-border py-2 text-sm last:border-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "flex min-w-0 items-center gap-1.5 text-left text-muted",
						onClick: () => setHint(hint === r.key ? null : r.key),
						"aria-label": `${t(lang, `budget.${r.key}`)} — ${r.healthy ? t(lang, "budget.leftoverOk") : t(lang, "budget.leftoverNeg")}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0",
							children: t(lang, `budget.${r.key}`)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, { className: "size-3.5 shrink-0" })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex shrink-0 items-center gap-2 tabular",
						children: [r.unit === "months" ? `${r.display} ${t(lang, "budget.monthsUnit")}` : formatPct(r.value, lang), r.healthy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
							className: "size-4 text-success",
							"aria-label": "Healthy"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
							className: "size-4 text-danger",
							"aria-label": "Needs attention"
						})]
					})]
				}, r.key)), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 rounded-md bg-card px-3 py-2 text-xs text-muted",
					children: t(lang, `budget.hints.${hint}`)
				}) : null]
			})]
		})
	] });
}
function YearlyCard() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const year = month.slice(0, 4);
	const rows = (0, import_react.useMemo)(() => yearRows(profile, year), [profile, year]);
	const totals = rows.reduce((acc, r) => ({
		income: acc.income + r.income,
		expenses: acc.expenses + r.expenses,
		saved: acc.saved + r.saved,
		invested: acc.invested + r.invested,
		leftover: acc.leftover + r.leftover
	}), {
		income: 0,
		expenses: 0,
		saved: 0,
		invested: 0,
		leftover: 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "flex items-center gap-2 text-lg font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-5" }), t(lang, "budget.yearly", { year })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: t(lang, "budget.yearlyHint")
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-10 text-center text-sm text-subtle",
			children: t(lang, "budget.noYearly")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 h-44",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
					data: rows,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "month",
							tick: {
								fill: "var(--color-muted)",
								fontSize: 11
							},
							axisLine: false,
							tickLine: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							formatter: (v) => formatMoney(Number(v), currency, lang),
							contentStyle: {
								background: "var(--color-card)",
								border: "1px solid var(--color-border)"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "income",
							fill: "var(--color-chart-2)",
							radius: [
								3,
								3,
								0,
								0
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "expenses",
							fill: "var(--color-danger)"
						})
					]
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: t(lang, "budget.totalIncome"),
			value: formatMoney(totals.income, currency, lang)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: t(lang, "budget.totalExpenses"),
			value: formatMoney(totals.expenses, currency, lang),
			tone: "danger"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: t(lang, "budget.totalSaved"),
			value: formatMoney(totals.saved, currency, lang),
			tone: "success"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: t(lang, "budget.totalInvested"),
			value: formatMoney(totals.invested, currency, lang)
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: t(lang, "budget.finalBalance"),
			value: formatMoney(totals.leftover, currency, lang)
		})
	] });
}
function TipCard() {
	const lang = useAppStore((s) => s.lang);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const data = useMonthData();
	const snap = monthSnapshot(profile, month);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	const health = computeHealth({
		...profile.assets,
		debts: profile.debts,
		monthlyEssentials: snap.essential || snap.targets.essential,
		monthlyIncome: snap.income,
		monthlySaved: snap.savings,
		monthlyInvested: snap.investing
	});
	function localTip() {
		const tip = pickTip({
			netIncome: snap.income,
			essentialExpenses: snap.essential,
			flexibleExpenses: snap.flexible,
			savings: snap.savings,
			investments: snap.investing,
			debts: health.totalLiabilities,
			netWorth: health.netWorth,
			liquidityMonths: health.ratios.find((r) => r.key === "liquidity")?.value ?? 0,
			savingsInvestmentRate: health.ratios.find((r) => r.key === "savInvRate")?.value ?? 0,
			leftToBudget: snap.leftToBudget,
			leftover: snap.leftover
		}, profile.tipId);
		useAppStore.getState().setAiTip(lang === "es" ? tip.es : tip.en, tip.id);
	}
	async function grokTip() {
		setLoading(true);
		setErr(null);
		const snapshot = [
			`lang=${lang}`,
			`income=${data.income}`,
			`essential=${snap.essential}`,
			`flexible=${snap.flexible}`,
			`savings=${snap.savings}`,
			`investing=${snap.investing}`,
			`leftover=${snap.leftover}`,
			`leftToBudget=${snap.leftToBudget}`,
			`goals=${profile.goals.map((g) => `${g.name}:${g.current}/${g.target}`).join(";")}`,
			`debts=${profile.debts.map((d) => `${d.name}:${d.balance}@${d.ratePct}`).join(";")}`,
			`assets=${JSON.stringify(profile.assets)}`
		].join("\n");
		try {
			const res = await getAiTip({ data: {
				lang,
				snapshot
			} });
			if (res.ok) useAppStore.getState().setAiTip(res.text, "grok");
			else {
				setErr(t(lang, "budget.aiUnavailable"));
				localTip();
			}
		} catch {
			setErr(t(lang, "budget.aiUnavailable"));
			localTip();
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "flex items-center gap-2 text-lg font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbulb, { className: "size-5 text-primary" }), t(lang, "budget.aiTitle")]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: t(lang, "budget.aiHint")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-3 text-sm leading-relaxed",
			children: loading ? t(lang, "budget.aiLoading") : profile.aiTip || t(lang, "budget.aiEmpty")
		}),
		err ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-danger",
			children: err
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-col gap-2 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				className: "flex-1",
				onClick: localTip,
				disabled: loading,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "size-4" }), t(lang, "budget.aiCta")]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				className: "flex-1",
				onClick: grokTip,
				disabled: loading,
				children: t(lang, "budget.askGrok")
			})]
		})
	] });
}
function Progress({ value, className, barClassName }) {
	const pct = Math.max(0, Math.min(100, value));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("h-2 w-full overflow-hidden rounded-full bg-elevated", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("h-full rounded-full bg-primary transition-[width] duration-300", barClassName),
			style: { width: `${pct}%` }
		})
	});
}
function IncomeCard() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const month = useAppStore((s) => s.activeMonth);
	const data = useMonthData();
	const setIncome = useAppStore((s) => s.setIncome);
	const copyPreviousMonth = useAppStore((s) => s.copyPreviousMonth);
	const sym = currencySymbol(currency);
	const [draft, setDraft] = (0, import_react.useState)(null);
	const shown = draft ?? String(data.income || "");
	function commit() {
		const parsed = evalAmountExpr(draft ?? shown);
		if (parsed !== null) setIncome(parsed);
		setDraft(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "mb-3 flex items-center gap-2 text-base font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "size-5 text-primary" }), t(lang, "budget.incomeTitle", { month: monthTitle(month, lang) })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex overflow-hidden rounded-md bg-elevated card-shadow",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex items-center px-3 text-muted",
				children: sym
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				inputMode: "decimal",
				className: "h-12 min-w-0 flex-1 bg-transparent px-2 text-lg tabular outline-none",
				value: shown,
				onChange: (e) => setDraft(e.target.value),
				onBlur: commit,
				onKeyDown: (e) => {
					if (e.key === "Enter") e.currentTarget.blur();
				},
				"aria-label": t(lang, "budget.incomeTitle", { month: monthTitle(month, lang) })
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-xs text-subtle",
			children: t(lang, "budget.incomeExprHint")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			className: "mt-2 px-0 text-muted",
			onClick: () => copyPreviousMonth(),
			children: t(lang, "budget.copyMonth")
		})
	] });
}
function CategoryCard({ id, icon, title, hint }) {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const snap = monthSnapshot(profile, month);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [editSource, setEditSource] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)(0);
	const [freq, setFreq] = (0, import_react.useState)("monthly");
	const [inflowOpen, setInflowOpen] = (0, import_react.useState)(false);
	const [inflowId, setInflowId] = (0, import_react.useState)(null);
	const [inflowName, setInflowName] = (0, import_react.useState)("");
	const [inflowAmount, setInflowAmount] = (0, import_react.useState)(0);
	const [inflowRepeat, setInflowRepeat] = (0, import_react.useState)(true);
	const [inflowFreq, setInflowFreq] = (0, import_react.useState)("monthly");
	const items = displayItemsFor(profile, month, id);
	const actual = snap[id];
	const extras = id === "investing" ? extrasFor(profile, month, id) : 0;
	const target = snap.targets[id];
	const available = target + extras;
	const pct = profile.percents[id];
	const remaining = available - actual;
	const usedPct = available > 0 ? actual / available * 100 : 0;
	const inflows = (profile.inflows ?? []).filter((inf) => (inf.category ?? "investing") === id);
	function openAdd() {
		setEditingId(null);
		setEditSource(null);
		setName("");
		setAmount(0);
		setFreq("monthly");
		setOpen(true);
	}
	function openEdit(it) {
		if (!it.editable) return;
		if (it.source === "recurring" && it.sourceId) {
			const rec = profile.recurring.find((r) => r.id === it.sourceId);
			setEditingId(it.sourceId);
			setEditSource("recurring");
			setFreq(rec?.frequency ?? "monthly");
		} else {
			setEditingId(it.id);
			setEditSource("manual");
			setFreq("monthly");
		}
		setName(it.name);
		setAmount(it.amount);
		setOpen(true);
	}
	function saveItem() {
		if (!name.trim()) return;
		if (editingId && editSource === "recurring") useAppStore.getState().updateRecurring(editingId, {
			name: name.trim(),
			amount,
			frequency: freq
		});
		else if (editingId) useAppStore.getState().updateItem(editingId, {
			name: name.trim(),
			amount
		});
		else useAppStore.getState().addItem({
			name: name.trim(),
			amount,
			category: id
		});
		setName("");
		setAmount(0);
		setEditingId(null);
		setEditSource(null);
		setOpen(false);
	}
	function openAddInflow() {
		setInflowId(null);
		setInflowName("");
		setInflowAmount(0);
		setInflowRepeat(true);
		setInflowFreq("monthly");
		setInflowOpen(true);
	}
	function openEditInflow(idToEdit) {
		const inf = profile.inflows.find((x) => x.id === idToEdit);
		if (!inf) return;
		setInflowId(inf.id);
		setInflowName(inf.name);
		setInflowAmount(inf.amount);
		setInflowRepeat(inf.recurring);
		setInflowFreq(inf.frequency ?? "monthly");
		setInflowOpen(true);
	}
	function saveInflow() {
		if (!inflowName.trim() || inflowAmount <= 0) return;
		if (inflowId) useAppStore.getState().updateInflow(inflowId, {
			name: inflowName.trim(),
			amount: inflowAmount,
			recurring: inflowRepeat,
			frequency: inflowFreq
		});
		else useAppStore.getState().addInflow({
			name: inflowName.trim(),
			amount: inflowAmount,
			category: id,
			recurring: inflowRepeat,
			frequency: inflowFreq,
			startMonth: month,
			active: true
		});
		setInflowOpen(false);
		setInflowId(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-muted",
				children: icon
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: hint
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap items-center justify-between gap-2 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				t(lang, "budget.target"),
				": ",
				formatMoney(target, currency, lang)
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-1 text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "h-11 w-20 px-2",
					type: "number",
					step: "0.1",
					inputMode: "decimal",
					value: pct,
					onChange: (e) => useAppStore.getState().setPercent(id, Number(e.target.value) || 0),
					"aria-label": t(lang, "budget.target")
				}), "%"]
			})]
		}),
		extras > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex justify-between text-sm text-success",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(lang, "budget.extrasLine") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "tabular",
				children: ["+", formatMoney(extras, currency, lang)]
			})]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
			value: usedPct,
			className: "my-2",
			barClassName: usedPct > 100 ? "bg-danger" : void 0
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-between text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				t(lang, "budget.actual"),
				": ",
				formatMoney(actual, currency, lang)
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-muted",
				children: [
					"(",
					usedPct.toFixed(1),
					"%)"
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-1 flex justify-between text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [t(lang, "budget.remaining"), ":"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("tabular", remaining < 0 ? "text-danger" : "text-success"),
				children: formatMoney(remaining, currency, lang)
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm font-medium",
				children: [
					title,
					" ",
					t(lang, "budget.items")
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center justify-between gap-2 text-xs text-muted sm:justify-end",
				children: [t(lang, "budget.adjustment"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "h-11 w-28",
					type: "number",
					inputMode: "decimal",
					value: profile.adjustments[id],
					onChange: (e) => useAppStore.getState().setAdjustment(id, Number(e.target.value) || 0)
				})]
			})]
		}),
		items.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-6 text-center text-sm text-subtle",
			children: t(lang, "budget.noItems")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 space-y-1.5",
			children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center gap-1 rounded-md bg-elevated pl-3 pr-1 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: "min-h-11 min-w-0 flex-1 py-2 text-left disabled:opacity-100",
						onClick: () => openEdit(it),
						disabled: !it.editable,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate",
							children: it.name
						}), it.source !== "manual" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[0.65rem] uppercase tracking-wide text-muted",
							children: it.source === "recurring" ? t(lang, "budget.badgeRecurring") : it.source === "debt" ? t(lang, "budget.badgeDebt") : t(lang, "budget.badgeInstallment")
						}) : null]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular",
						children: formatMoney(it.amount, currency, lang)
					}),
					it.editable ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => openEdit(it),
						className: "flex size-11 shrink-0 items-center justify-center text-muted hover:text-fg",
						"aria-label": t(lang, "common.edit"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-11 shrink-0" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							if (it.source === "recurring" && it.sourceId) useAppStore.getState().skipRecurring(it.sourceId);
							else if (it.source === "large" && it.sourceId) useAppStore.getState().skipLarge(it.sourceId);
							else if (it.source === "debt" && it.sourceId) useAppStore.getState().skipDebt(it.sourceId);
							else useAppStore.getState().removeItem(it.id);
						},
						className: "flex size-11 shrink-0 items-center justify-center text-muted hover:text-danger",
						"aria-label": t(lang, "common.delete"),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})
				]
			}, it.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "secondary",
			className: "mt-3 w-full",
			onClick: openAdd,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }),
				" ",
				t(lang, "budget.addItem")
			]
		}),
		id === "investing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 border-t border-border pt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-sm font-medium",
					children: t(lang, "budget.extras")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted",
					children: t(lang, "budget.extrasHint")
				}),
				inflows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "py-4 text-center text-sm text-subtle",
					children: t(lang, "budget.noInflows")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1.5",
					children: inflows.map((inf) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-1 rounded-md bg-elevated pl-3 pr-1 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "min-h-11 min-w-0 flex-1 py-2 text-left",
								onClick: () => openEditInflow(inf.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block truncate",
									children: inf.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[0.65rem] uppercase tracking-wide text-muted",
									children: inf.recurring ? t(lang, FREQ_LABEL[inf.frequency ?? "monthly"]) : t(lang, "budget.oneTime")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "tabular text-success",
								children: ["+", formatMoney(inf.amount, currency, lang)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => openEditInflow(inf.id),
								className: "flex size-11 shrink-0 items-center justify-center text-muted hover:text-fg",
								"aria-label": t(lang, "common.edit"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => useAppStore.getState().removeInflow(inf.id),
								className: "flex size-11 shrink-0 items-center justify-center text-muted hover:text-danger",
								"aria-label": t(lang, "common.delete"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}, inf.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					className: "mt-3 w-full",
					onClick: openAddInflow,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }),
						" ",
						t(lang, "budget.addInflow")
					]
				})
			]
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: (v) => {
				setOpen(v);
				if (!v) {
					setEditingId(null);
					setEditSource(null);
				}
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
				title: editSource === "recurring" ? t(lang, "budget.editRecurring") : editingId ? t(lang, "budget.editItem") : t(lang, "budget.addItem"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.name") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.total") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
								value: amount,
								onValue: setAmount
							}, editingId ?? "new-item"),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: t(lang, "budget.amountExprHint")
							})
						] }),
						editSource === "recurring" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.frequency") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: freq,
							onChange: (e) => setFreq(e.target.value),
							children: RECURRING_FREQS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: f,
								children: t(lang, FREQ_LABEL[f])
							}, f))
						})] }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: saveItem,
							children: t(lang, "budget.save")
						})
					]
				})
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: inflowOpen,
			onOpenChange: setInflowOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
				title: inflowId ? t(lang, "budget.editInflow") : t(lang, "budget.addInflow"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: t(lang, "budget.extrasHint")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.name") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: inflowName,
							onChange: (e) => setInflowName(e.target.value),
							placeholder: "eToro Popular Investor"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.total") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
								value: inflowAmount,
								onValue: setInflowAmount
							}, inflowId ?? "new-inflow"),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: t(lang, "budget.amountExprHint")
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: inflowRepeat,
								onChange: (e) => setInflowRepeat(e.target.checked),
								className: "size-4"
							}), t(lang, "budget.inflowRepeat")]
						}),
						inflowRepeat ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.frequency") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: inflowFreq,
							onChange: (e) => setInflowFreq(e.target.value),
							children: RECURRING_FREQS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: f,
								children: t(lang, FREQ_LABEL[f])
							}, f))
						})] }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: saveInflow,
							children: t(lang, "budget.save")
						})
					]
				})
			})
		})
	] });
}
function GoalsCard() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const data = useMonthData();
	const snap = monthSnapshot(profile, month);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [goalTarget, setGoalTarget] = (0, import_react.useState)(0);
	const [goalCurrent, setGoalCurrent] = (0, import_react.useState)(0);
	const contrib = snap.savings;
	const target = snap.targets.savings;
	const used = target > 0 ? contrib / target * 100 : 0;
	function openAdd() {
		setEditingId(null);
		setName("");
		setGoalTarget(0);
		setGoalCurrent(0);
		setOpen(true);
	}
	function openEdit(id) {
		const g = profile.goals.find((x) => x.id === id);
		if (!g) return;
		setEditingId(id);
		setName(g.name);
		setGoalTarget(g.target);
		setGoalCurrent(g.current);
		setOpen(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "flex items-center gap-2 text-lg font-semibold",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PiggyBank, { className: "size-5 text-primary" }), t(lang, "budget.goals")]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-1 text-sm text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "h-11 w-20 px-2",
					type: "number",
					step: "0.1",
					value: profile.percents.savings,
					onChange: (e) => useAppStore.getState().setPercent("savings", Number(e.target.value) || 0)
				}), "%"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: t(lang, "budget.goalsHint")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex justify-between text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t(lang, "budget.totalMonthly") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "tabular",
				children: [
					formatMoney(contrib, currency, lang),
					" / ",
					formatMoney(target, currency, lang)
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
			value: used,
			className: "my-2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between text-xs text-muted",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				t(lang, "budget.remaining"),
				" (",
				used.toFixed(1),
				"%)"
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-2",
				children: [t(lang, "budget.adjustment"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "h-11 w-24",
					type: "number",
					value: profile.adjustments.savings,
					onChange: (e) => useAppStore.getState().setAdjustment("savings", Number(e.target.value) || 0)
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-3",
			children: [
				profile.goals.map((g) => {
					const monthAmt = data.goalContributions[g.id] ?? 0;
					const shown = g.current + monthAmt;
					const gPct = g.target > 0 ? shown / g.target * 100 : 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: g.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted tabular",
									children: [
										formatMoney(shown, currency, lang),
										" / ",
										formatMoney(g.target, currency, lang)
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => openEdit(g.id),
										className: "flex size-11 items-center justify-center text-muted hover:text-fg",
										"aria-label": t(lang, "common.edit"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => useAppStore.getState().removeGoal(g.id),
										className: "flex size-11 items-center justify-center text-muted hover:text-danger",
										"aria-label": t(lang, "common.delete"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: gPct,
								className: "my-2"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: t(lang, "budget.thisMonth")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex overflow-hidden rounded-md bg-card card-shadow",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex items-center px-2 text-muted",
									children: currencySymbol(currency)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
									className: "h-10 min-w-0 flex-1 rounded-none bg-transparent px-2 text-sm",
									value: monthAmt,
									onValue: (n) => useAppStore.getState().setGoalContribution(g.id, n),
									placeholder: t(lang, "budget.amount")
								})]
							})
						]
					}, g.id);
				}),
				profile.largePurchases.filter((lp) => lp.category === "savings" && isLargeActive(lp, month)).map((lp) => {
					const prog = largeProgress(lp, month);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-lg bg-elevated p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: lp.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted",
								children: [
									t(lang, "budget.badgeInstallment"),
									" · ",
									t(lang, "budget.monthOf", {
										n: prog.index + 1,
										total: lp.months
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm tabular",
								children: formatMoney(installmentOf(lp), currency, lang)
							})
						]
					}, lp.id);
				}),
				profile.debts.filter((d) => (d.category ?? "essential") === "savings" && isDebtActive(d, month)).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-elevated p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: d.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: t(lang, "budget.badgeDebt")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm tabular",
							children: formatMoney(d.minPayment, currency, lang)
						})
					]
				}, d.id))
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "secondary",
			className: "mt-3 w-full",
			onClick: openAdd,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }),
				" ",
				t(lang, "budget.addGoal")
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: (v) => {
				setOpen(v);
				if (!v) setEditingId(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
				title: editingId ? t(lang, "budget.editGoal") : t(lang, "budget.addGoal"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.name") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.targetAmount") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
							value: goalTarget,
							onValue: setGoalTarget
						}, `${editingId ?? "new"}-target`)] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.alreadySaved") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
							value: goalCurrent,
							onValue: setGoalCurrent
						}, `${editingId ?? "new"}-current`)] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: () => {
								if (!name.trim()) return;
								if (editingId) useAppStore.getState().updateGoal(editingId, {
									name: name.trim(),
									target: goalTarget,
									current: goalCurrent
								});
								else useAppStore.getState().addGoal({
									name: name.trim(),
									target: goalTarget,
									current: goalCurrent
								});
								setName("");
								setGoalTarget(0);
								setGoalCurrent(0);
								setEditingId(null);
								setOpen(false);
							},
							children: t(lang, "budget.save")
						})
					]
				})
			})
		})
	] });
}
function DebtAllocCard() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const snap = monthSnapshot(profile, month);
	const actual = snap.debt;
	const target = snap.targets.debt;
	const remaining = target - actual;
	const usedPct = target > 0 ? actual / target * 100 : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: t(lang, "budget.debtAlloc")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-5 text-muted" })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: t(lang, "budget.debtAllocHint")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex items-end justify-between text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				t(lang, "budget.target"),
				": ",
				formatMoney(target, currency, lang)
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-center gap-1 text-muted",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "h-11 w-20 px-2",
					type: "number",
					step: "0.1",
					value: profile.percents.debt,
					onChange: (e) => useAppStore.getState().setPercent("debt", Number(e.target.value) || 0)
				}), "%"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
			value: usedPct,
			className: "my-2"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex justify-between text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				t(lang, "budget.actual"),
				": ",
				formatMoney(actual, currency, lang)
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("tabular", remaining < 0 ? "text-danger" : "text-success"),
				children: formatMoney(remaining, currency, lang)
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 space-y-2",
			children: [profile.largePurchases.filter((lp) => lp.category === "debt" && isLargeActive(lp, month)).map((lp) => {
				const prog = largeProgress(lp, month);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg bg-elevated p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: lp.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								t(lang, "budget.badgeInstallment"),
								" · ",
								t(lang, "budget.monthOf", {
									n: prog.index + 1,
									total: lp.months
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm tabular",
							children: formatMoney(installmentOf(lp), currency, lang)
						})
					]
				}, lp.id);
			}), profile.debts.filter((d) => d.category === "debt" && isDebtActive(d, month)).map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: d.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: t(lang, "budget.badgeDebt")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm tabular",
						children: formatMoney(d.minPayment, currency, lang)
					})
				]
			}, d.id))]
		})
	] });
}
function MonthlySummary() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const snap = monthSnapshot(profile, month);
	const pie = [
		{
			name: t(lang, "budget.essential"),
			value: snap.essential,
			color: "var(--color-chart-1)"
		},
		{
			name: t(lang, "budget.flexible"),
			value: snap.flexible,
			color: "var(--color-warning)"
		},
		{
			name: t(lang, "budget.investing"),
			value: snap.investing,
			color: "var(--color-primary)"
		},
		{
			name: t(lang, "budget.goals"),
			value: snap.savings,
			color: "var(--color-success)"
		},
		{
			name: t(lang, "budget.debtAlloc"),
			value: snap.debt,
			color: "var(--color-danger)"
		}
	].filter((d) => d.value > 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold",
			children: t(lang, "budget.monthlySummary")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: t(lang, "budget.monthlyHint")
		}),
		pie.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-10 text-center text-sm text-subtle",
			children: t(lang, "budget.enterSpending")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mx-auto h-48 w-full max-w-xs",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: "100%",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
					data: pie,
					dataKey: "value",
					nameKey: "name",
					innerRadius: 52,
					outerRadius: 80,
					paddingAngle: 2,
					label: false,
					labelLine: false,
					isAnimationActive: false,
					children: pie.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: p.color }, p.name))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (v) => formatMoney(Number(v), currency, lang) })] })
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: t(lang, "budget.totalIncome"),
			value: formatMoney(snap.income, currency, lang)
		}),
		snap.extras > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: t(lang, "budget.extrasLine"),
			value: formatMoney(snap.extras, currency, lang),
			tone: "success"
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: t(lang, "budget.totalExpenses"),
			value: formatMoney(snap.expenses, currency, lang),
			tone: "danger"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: t(lang, "budget.totalSavedInv"),
			value: formatMoney(snap.savedInv, currency, lang),
			tone: "success"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
			label: t(lang, "budget.finalBalance"),
			value: formatMoney(snap.leftover, currency, lang)
		})
	] });
}
//#endregion
export { IncomeCard as a, TipCard as c, HealthCard as i, YearlyCard as l, DebtAllocCard as n, MonthlySummary as o, GoalsCard as r, Progress as s, CategoryCard as t };

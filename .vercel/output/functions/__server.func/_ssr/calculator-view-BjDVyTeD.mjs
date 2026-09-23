import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { L as useAppStore, N as t, _ as formatPct, c as currencySymbol, g as formatMoney, r as INTL_LOCALE } from "./store-DJ-NhLM1.mjs";
import { t as Button } from "./button-BfLOEi7q.mjs";
import { t as Label } from "./label-CXJ1augD.mjs";
import { t as NativeSelect } from "./native-select-D218FZZi.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, l as Pie, n as PieChart, r as BarChart, s as CartesianGrid, u as Cell } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calculator-view-BjDVyTeD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FREQ = {
	weekly: {
		perYear: 52,
		es: "Semanalmente (52/Año)",
		en: "Weekly (52/Year)",
		shortEs: "Semanal",
		shortEn: "Weekly"
	},
	biweekly: {
		perYear: 26,
		es: "Quincenalmente (26/Año)",
		en: "Biweekly (26/Year)",
		shortEs: "Quincenal",
		shortEn: "Biweekly"
	},
	monthly: {
		perYear: 12,
		es: "Mensualmente (12/Año)",
		en: "Monthly (12/Year)",
		shortEs: "Mensual",
		shortEn: "Monthly"
	},
	quarterly: {
		perYear: 4,
		es: "Trimestralmente (4/Año)",
		en: "Quarterly (4/Year)",
		shortEs: "Trimestral",
		shortEn: "Quarterly"
	},
	annually: {
		perYear: 1,
		es: "Anualmente (1/Año)",
		en: "Annually (1/Year)",
		shortEs: "Anual",
		shortEn: "Annual"
	}
};
var FREQ_KEYS = Object.keys(FREQ);
function simulate(input) {
	const { principal, pmt, timing } = input;
	const periodsPerYear = Math.max(1, input.periodsPerYear);
	const totalPeriods = Math.max(0, Math.round(input.years * periodsPerYear));
	const i = input.annualRatePct / 100 / periodsPerYear;
	let balance = principal;
	let totalDeposits = principal;
	let totalInterest = 0;
	const rows = [];
	let yearDeposits = 0;
	if (totalPeriods === 0) return [{
		year: 0,
		periodDeposits: 0,
		totalDeposits: principal,
		totalInterest: 0,
		balance: principal
	}];
	for (let p = 1; p <= totalPeriods; p++) {
		if (timing === "begin") {
			balance += pmt;
			totalDeposits += pmt;
			yearDeposits += pmt;
		}
		const interest = balance * i;
		balance += interest;
		totalInterest += interest;
		if (timing === "end") {
			balance += pmt;
			totalDeposits += pmt;
			yearDeposits += pmt;
		}
		if (p % periodsPerYear === 0 || p === totalPeriods) {
			rows.push({
				year: Math.ceil(p / periodsPerYear),
				periodDeposits: yearDeposits,
				totalDeposits,
				totalInterest,
				balance
			});
			yearDeposits = 0;
		}
	}
	return rows;
}
function futureValue(input) {
	const rows = simulate(input);
	return rows[rows.length - 1]?.balance ?? input.principal;
}
function pow1p(i, n) {
	return (1 + i) ** n;
}
/** Closed-form PMT so FV equals the goal. */
function solvePmt(input) {
	const { principal, goal, timing, years } = input;
	const m = Math.max(1, input.periodsPerYear);
	const n = Math.round(years * m);
	const i = input.annualRatePct / 100 / m;
	const remaining = goal - principal * pow1p(i, n);
	if (n <= 0) return 0;
	if (Math.abs(i) < 1e-12) return remaining / n;
	const factor = (pow1p(i, n) - 1) / i;
	const due = timing === "begin" ? 1 + i : 1;
	if (factor * due === 0) return 0;
	return remaining / (factor * due);
}
function solveTime(input) {
	const { principal, pmt, goal, timing } = input;
	const m = Math.max(1, input.periodsPerYear);
	const i = input.annualRatePct / 100 / m;
	if (principal >= goal) return {
		years: 0,
		periods: 0,
		reachable: true
	};
	const maxPeriods = m * 120;
	let balance = principal;
	for (let p = 1; p <= maxPeriods; p++) {
		if (timing === "begin") balance += pmt;
		balance += balance * i;
		if (timing === "end") balance += pmt;
		if (balance >= goal) return {
			years: p / m,
			periods: p,
			reachable: true
		};
		if (pmt <= 0 && i <= 0) break;
	}
	return {
		years: Infinity,
		periods: maxPeriods,
		reachable: false
	};
}
function solveRate(input) {
	const { principal, pmt, goal, years, timing, periodsPerYear } = input;
	if (futureValue({
		...input,
		annualRatePct: 0
	}) >= goal - .005) return 0;
	if (goal <= 0) return 0;
	let lo = 0;
	let hi = 100;
	for (let k = 0; k < 12; k++) {
		if (futureValue({
			...input,
			annualRatePct: hi
		}) >= goal) break;
		hi *= 2;
		if (hi > 1e6) return NaN;
	}
	if (futureValue({
		...input,
		annualRatePct: hi
	}) < goal) return NaN;
	for (let k = 0; k < 60; k++) {
		const mid = (lo + hi) / 2;
		if (futureValue({
			principal,
			pmt,
			annualRatePct: mid,
			years,
			periodsPerYear,
			timing
		}) >= goal) hi = mid;
		else lo = mid;
	}
	return hi;
}
function calculate(input) {
	const periodsPerYear = FREQ[input.freq].perYear;
	const principal = Math.max(0, input.principal);
	const goal = Math.max(0, input.goal);
	let pmt = input.pmt;
	let annualRatePct = input.annualRatePct;
	let years = Math.max(0, input.years);
	const timing = input.timing;
	if (input.mode === "pmt") {
		pmt = solvePmt({
			principal,
			goal,
			annualRatePct,
			years,
			periodsPerYear,
			timing
		});
		if (!Number.isFinite(pmt)) return {
			ok: false,
			error: "invalid"
		};
	}
	if (input.mode === "rate") {
		annualRatePct = solveRate({
			principal,
			pmt,
			goal,
			years,
			periodsPerYear,
			timing
		});
		if (!Number.isFinite(annualRatePct)) return {
			ok: false,
			error: "unreachable"
		};
	}
	if (input.mode === "time") {
		const t = solveTime({
			principal,
			pmt,
			goal,
			annualRatePct,
			periodsPerYear,
			timing
		});
		if (!t.reachable) return {
			ok: false,
			error: "unreachable"
		};
		years = t.years;
	}
	const simYears = input.mode === "time" ? Math.max(years, 1 / periodsPerYear) : Math.max(years, 0);
	const rows = simulate({
		principal,
		pmt,
		annualRatePct,
		years: simYears,
		periodsPerYear,
		timing
	});
	const last = rows[rows.length - 1];
	const finalBalance = last?.balance ?? principal;
	const totalDeposits = last?.totalDeposits ?? principal;
	const totalInterest = last?.totalInterest ?? 0;
	const totalPeriodic = Math.max(0, totalDeposits - principal);
	const monthsRemainder = Math.round((years - Math.floor(years)) * 12);
	return {
		ok: true,
		mode: input.mode,
		finalBalance,
		totalDeposits,
		totalPeriodic,
		totalInterest,
		principal,
		pmt,
		annualRatePct,
		years,
		yearsNeeded: input.mode === "time" ? years : void 0,
		monthsRemainder: input.mode === "time" ? monthsRemainder : void 0,
		pmtNeeded: input.mode === "pmt" ? pmt : void 0,
		rateNeeded: input.mode === "rate" ? annualRatePct : void 0,
		reachable: true,
		alreadyThere: principal >= goal && (input.mode === "time" || input.mode === "rate" || input.mode === "pmt"),
		rows,
		freq: input.freq,
		timing
	};
}
var MODE_KEYS = {
	save: "calc.modeSave",
	time: "calc.modeTime",
	pmt: "calc.modePmt",
	rate: "calc.modeRate"
};
var MODES_LIST = [
	"save",
	"time",
	"pmt",
	"rate"
];
var FREQ_LONG = {
	weekly: "calc.freqWeekly",
	biweekly: "calc.freqBiweekly",
	monthly: "calc.freqMonthly",
	quarterly: "calc.freqQuarterly",
	annually: "calc.freqAnnually"
};
var FREQ_SHORT = {
	weekly: "calc.freqShortWeekly",
	biweekly: "calc.freqShortBiweekly",
	monthly: "calc.freqShortMonthly",
	quarterly: "calc.freqShortQuarterly",
	annually: "calc.freqShortAnnually"
};
function CalculatorView({ embedded = false }) {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const calc = useAppStore((s) => s.calc);
	const setCalc = useAppStore((s) => s.setCalc);
	const [result, setResult] = (0, import_react.useState)(() => calculate(calc));
	const [error, setError] = (0, import_react.useState)(null);
	const sym = currencySymbol(currency);
	function run() {
		const out = calculate(calc);
		if (!out.ok) {
			setError(t(lang, "calc.unreachable"));
			setResult(out);
			return;
		}
		setError(null);
		setResult(out);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: embedded ? "w-full" : "mx-auto w-full max-w-lg md:max-w-3xl",
		children: [
			embedded ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: t(lang, "nav.calculator")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: t(lang, "budget.invCalcHint")
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "space-y-4",
				onSubmit: (e) => {
					e.preventDefault();
					run();
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						className: "h-12 bg-field text-field-fg",
						value: calc.mode,
						onChange: (e) => setCalc({ mode: e.target.value }),
						"aria-label": t(lang, "calc.modeSave"),
						children: MODES_LIST.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: m,
							children: t(lang, MODE_KEYS[m])
						}, m))
					}),
					calc.mode !== "save" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						label: t(lang, "calc.goal"),
						symbol: sym,
						value: calc.goal,
						onChange: (n) => setCalc({ goal: n })
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						label: t(lang, "calc.principal"),
						symbol: sym,
						value: calc.principal,
						onChange: (n) => setCalc({ principal: n })
					}),
					calc.mode === "pmt" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "calc.freq") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						className: "h-12 bg-field text-field-fg",
						value: calc.freq,
						onChange: (e) => setCalc({ freq: e.target.value }),
						children: FREQ_KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: k,
							children: t(lang, FREQ_LONG[k])
						}, k))
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MoneyField, {
						label: t(lang, "calc.pmt"),
						symbol: sym,
						value: calc.pmt,
						onChange: (n) => setCalc({ pmt: n }),
						suffix: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "w-[7.75rem] shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
								className: "h-11 rounded-none rounded-r-[7px] bg-elevated text-fg shadow-none",
								value: calc.freq,
								onChange: (e) => setCalc({ freq: e.target.value }),
								children: FREQ_KEYS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: k,
									children: t(lang, FREQ_SHORT[k])
								}, k))
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "calc.timing") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
						className: "h-12 bg-field text-field-fg",
						value: calc.timing,
						onChange: (e) => setCalc({ timing: e.target.value }),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "begin",
							children: t(lang, "calc.timingBegin")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "end",
							children: t(lang, "calc.timingEnd")
						})]
					})] }),
					calc.mode !== "rate" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PercentField, {
						label: t(lang, "calc.rate"),
						value: calc.annualRatePct,
						onChange: (n) => setCalc({ annualRatePct: n })
					}) : null,
					calc.mode !== "time" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "calc.duration") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex overflow-hidden rounded-sm calc-field",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "number",
							min: 0,
							step: 1,
							className: "h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-field-fg outline-none tabular",
							value: calc.years,
							onChange: (e) => setCalc({ years: Number(e.target.value) || 0 })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex items-center px-4 text-sm text-field-fg/70",
							children: t(lang, "calc.years")
						})]
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex pt-1 max-md:w-full",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							className: "h-11 rounded-md px-5 max-md:w-full",
							children: t(lang, "calc.calculate")
						})
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 rounded-lg border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger",
				children: error
			}) : null,
			result && result.ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Results, {
				result,
				lang,
				currency,
				goal: calc.goal
			}) : null
		]
	});
}
function MoneyField({ label, symbol, value, onChange, suffix }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex rounded-sm calc-field",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "calc-addon flex items-center justify-center px-3 text-sm font-medium",
				children: symbol
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "number",
				min: 0,
				step: "0.01",
				className: "h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-field-fg outline-none tabular",
				value: Number.isFinite(value) ? value : 0,
				onChange: (e) => onChange(Number(e.target.value) || 0)
			}),
			suffix
		]
	})] });
}
function PercentField({ label, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex overflow-hidden rounded-sm calc-field",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "number",
			min: 0,
			step: "0.001",
			className: "h-11 min-w-0 flex-1 bg-transparent px-3 text-sm text-field-fg outline-none tabular",
			value: Number.isFinite(value) ? value : 0,
			onChange: (e) => onChange(Number(e.target.value) || 0)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "calc-addon flex items-center justify-center px-3 text-sm font-medium",
			children: "%"
		})]
	})] });
}
function Results({ result, lang, currency, goal }) {
	const money = (n) => formatMoney(n, currency, lang);
	const freqWord = t(lang, FREQ_SHORT[result.freq]).toLowerCase();
	const duration = result.years >= 1 ? `${new Intl.NumberFormat(INTL_LOCALE[lang] ?? "en-US", { maximumFractionDigits: 1 }).format(result.years)} ${t(lang, result.years === 1 ? "calc.year" : "calc.yearsWord")}` : `${Math.round(result.years * 12)} ${t(lang, "calc.monthsWord")}`;
	let headline = t(lang, "calc.youCanSave");
	let big = money(result.finalBalance);
	let sub = t(lang, "calc.savingLine", {
		pmt: money(result.pmt),
		freq: freqWord,
		duration
	});
	if (result.mode === "rate") {
		headline = t(lang, "calc.needRate");
		big = formatPct(result.rateNeeded ?? 0, lang, 3);
		sub = t(lang, "calc.toReach", { goal: money(goal) });
	} else if (result.mode === "pmt") {
		headline = t(lang, "calc.needSave");
		big = money(result.pmtNeeded ?? result.pmt);
		sub = t(lang, "calc.eachPeriod", {
			goal: money(goal),
			duration
		});
	} else if (result.mode === "time") {
		headline = t(lang, "calc.itWillTake");
		const y = Math.floor(result.yearsNeeded ?? result.years);
		const mo = result.monthsRemainder ?? 0;
		const parts = [];
		if (y > 0) parts.push(`${y} ${t(lang, y === 1 ? "calc.year" : "calc.yearsWord")}`);
		if (mo > 0) parts.push(`${mo} ${t(lang, mo === 1 ? "calc.month" : "calc.monthsWord")}`);
		big = parts.join(` ${t(lang, "calc.and")} `) || `0 ${t(lang, "calc.monthsWord")}`;
		sub = t(lang, "calc.toReachGoal", { goal: money(goal) });
	}
	const pie = [
		{
			name: t(lang, "calc.initial"),
			value: Math.max(0, result.principal),
			color: "var(--color-chart-1)"
		},
		{
			name: t(lang, "calc.periodic"),
			value: Math.max(0, result.totalPeriodic),
			color: "var(--color-chart-2)"
		},
		{
			name: t(lang, "calc.interest"),
			value: Math.max(0, result.totalInterest),
			color: "var(--color-chart-3)"
		}
	].filter((p) => p.value > .004);
	const bars = result.rows.map((r) => ({
		year: r.year,
		principal: result.principal,
		deposits: Math.max(0, r.totalDeposits - result.principal),
		interest: Math.max(0, r.totalInterest)
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-8 overflow-hidden rounded-xl border border-primary/40 bg-card p-5 md:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: headline
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-4xl font-semibold tracking-tight tabular md:text-5xl",
				children: big
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-muted",
				children: sub
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-5 h-px bg-border" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2 text-sm",
				children: pie.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-3 rounded-sm",
							style: { background: p.color }
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [p.name, ":"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "tabular",
						children: money(p.value)
					})]
				}, p.name))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mt-4 h-64 w-full max-w-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PieChart, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pie, {
						data: pie,
						dataKey: "value",
						nameKey: "name",
						cx: "50%",
						cy: "50%",
						outerRadius: 110,
						stroke: "var(--color-bg)",
						strokeWidth: 2,
						label: false,
						labelLine: false,
						isAnimationActive: false,
						children: pie.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cell, { fill: p.color }, p.name))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
						formatter: (v) => money(Number(v)),
						contentStyle: {
							background: "var(--color-card)",
							border: "1px solid var(--color-border)",
							borderRadius: 8
						}
					})] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 rounded-lg border border-primary/30 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted",
					children: pie.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "size-2.5 rounded-sm",
							style: { background: p.color }
						}), p.name]
					}, p.name))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-56 w-full",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: bars,
							margin: {
								top: 8,
								right: 8,
								left: -20,
								bottom: 0
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									vertical: false,
									stroke: "var(--color-border)",
									strokeDasharray: "3 3"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "year",
									tick: {
										fill: "var(--color-muted)",
										fontSize: 12
									},
									axisLine: false,
									tickLine: false,
									interval: bars.length > 8 ? 1 : 0
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									formatter: (v) => money(Number(v)),
									contentStyle: {
										background: "var(--color-card)",
										border: "1px solid var(--color-border)",
										borderRadius: 8
									}
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "principal",
									stackId: "a",
									fill: "var(--color-chart-1)",
									isAnimationActive: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "deposits",
									stackId: "a",
									fill: "var(--color-chart-2)",
									isAnimationActive: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "interest",
									stackId: "a",
									fill: "var(--color-chart-3)",
									radius: [
										3,
										3,
										0,
										0
									],
									isAnimationActive: false
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6 overflow-x-auto rounded-lg border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[36rem] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "border-b border-border text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: t(lang, "calc.tableYear")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: t(lang, "calc.tablePeriodic")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: t(lang, "calc.tableTotalDep")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: t(lang, "calc.tableInterest")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: t(lang, "calc.tableBalance")
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: result.rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-b border-border/70 last:border-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 tabular",
								children: row.year
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 tabular",
								children: money(row.periodDeposits)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 tabular",
								children: money(row.totalDeposits)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 tabular",
								children: money(row.totalInterest)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 tabular",
								children: money(row.balance)
							})
						]
					}, row.year)) })]
				})
			})
		]
	});
}
//#endregion
export { simulate as n, CalculatorView as t };

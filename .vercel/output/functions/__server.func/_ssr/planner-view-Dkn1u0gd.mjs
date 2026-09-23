import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { L as useAppStore, N as t, a as RECURRING_FREQS, g as formatMoney, n as FREQ_LABEL, o as allocI18nKey, s as cn, v as installmentOf, w as largeProgress, z as useProfile } from "./store-DJ-NhLM1.mjs";
import { t as Button } from "./button-BfLOEi7q.mjs";
import { t as Label } from "./label-CXJ1augD.mjs";
import { n as Panel, t as Fold } from "./panel-Btdc78ax.mjs";
import { T as House, c as TrendingDown, f as ShoppingBag, g as Play, h as Plus, l as Trash2, m as Repeat, s as TrendingUp, v as Pencil, w as Landmark, y as Pause } from "../_libs/lucide-react.mjs";
import { n as Dialog, r as DialogContent, t as AmountExprInput } from "./dialog-CNqxeaFt.mjs";
import { t as Input } from "./input-BWhrm__Q.mjs";
import { t as NativeSelect } from "./native-select-D218FZZi.mjs";
import { a as XAxis, c as Bar, d as ResponsiveContainer, f as Tooltip, i as YAxis, o as Area, r as BarChart, s as CartesianGrid, t as AreaChart } from "../_libs/recharts+[...].mjs";
import { a as IncomeCard, c as TipCard, i as HealthCard, l as YearlyCard, n as DebtAllocCard, o as MonthlySummary, r as GoalsCard, s as Progress, t as CategoryCard } from "./budget-cards-CgffNrRO.mjs";
import { n as simulate$1, t as CalculatorView } from "./calculator-view-BjDVyTeD.mjs";
import { i as SliderTrack, n as SliderRange, r as SliderThumb, t as Slider$1 } from "../_libs/@radix-ui/react-slider+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/planner-view-Dkn1u0gd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Slider({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Slider$1, {
		className: cn("relative flex w-full touch-none items-center select-none py-2", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderTrack, {
			className: "relative h-1.5 w-full grow overflow-hidden rounded-full bg-elevated",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderRange, { className: "absolute h-full bg-primary" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SliderThumb, { className: "block size-5 rounded-full bg-primary shadow-md ring-2 ring-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" })]
	});
}
function sortDebts(working, method) {
	working.sort((a, b) => {
		if (method === "avalanche") return b.ratePct - a.ratePct || a.balance - b.balance || a.id.localeCompare(b.id);
		return a.balance - b.balance || a.ratePct - b.ratePct || a.id.localeCompare(b.id);
	});
}
function simulate(debts, extraMonthly, method, cascadeFreedMins, maxMonths) {
	const originalTotal = debts.reduce((s, d) => s + Math.max(0, d.balance), 0);
	const working = debts.filter((d) => d.balance > .005).map((d) => ({
		...d,
		balance: d.balance
	}));
	if (working.length === 0) return {
		months: 0,
		totalInterest: 0,
		totalPaid: 0,
		schedule: [],
		debtFree: true,
		originalTotal: 0
	};
	const originalMinSum = working.reduce((s, d) => s + Math.max(0, d.minPayment), 0);
	const schedule = [];
	let totalInterest = 0;
	let totalPaid = 0;
	for (let m = 1; m <= maxMonths; m++) {
		let monthInterest = 0;
		let monthPaid = 0;
		for (const d of working) {
			if (d.balance <= .005) continue;
			const monthlyRate = d.ratePct / 100 / 12;
			const interest = d.balance * monthlyRate;
			d.balance += interest;
			monthInterest += interest;
			totalInterest += interest;
		}
		sortDebts(working, method);
		const focus = working.filter((d) => d.balance > .005)[0] ?? null;
		const payments = [];
		const remainingMins = working.reduce((s, d) => s + (d.balance > .005 ? Math.max(0, d.minPayment) : 0), 0);
		let pool = Math.max(0, extraMonthly) + (cascadeFreedMins ? originalMinSum : remainingMins);
		for (const d of working) {
			if (d.balance <= .005) continue;
			if (focus && d.id === focus.id) continue;
			const pay = Math.min(d.minPayment, d.balance);
			d.balance -= pay;
			if (d.balance < .005) d.balance = 0;
			pool -= pay;
			monthPaid += pay;
			totalPaid += pay;
			payments.push({
				id: d.id,
				name: d.name,
				payment: pay,
				interest: 0,
				balance: d.balance
			});
		}
		if (focus && focus.balance > .005) {
			const pay = Math.min(Math.max(pool, 0), focus.balance);
			focus.balance -= pay;
			if (focus.balance < .005) focus.balance = 0;
			monthPaid += pay;
			totalPaid += pay;
			payments.push({
				id: focus.id,
				name: focus.name,
				payment: pay,
				interest: 0,
				balance: focus.balance
			});
		}
		const remaining = working.reduce((s, d) => s + d.balance, 0);
		schedule.push({
			month: m,
			label: `M${m}`,
			payments,
			extraTo: focus?.name ?? null,
			totalPaid: monthPaid,
			totalInterest: monthInterest,
			remaining
		});
		if (remaining <= .05) return {
			months: m,
			totalInterest,
			totalPaid,
			schedule,
			debtFree: true,
			originalTotal
		};
		if (m > 12 && monthPaid + .01 < monthInterest && extraMonthly + remainingMins <= monthInterest) break;
	}
	return {
		months: schedule.length,
		totalInterest,
		totalPaid,
		schedule,
		debtFree: working.every((d) => d.balance <= .05),
		originalTotal
	};
}
function planPaydown(debts, extraMonthly, method, maxMonths = 360) {
	const planned = simulate(debts, extraMonthly, method, true, maxMonths);
	const minOnly = simulate(debts, 0, method, false, maxMonths);
	const interestSaved = Math.max(0, minOnly.totalInterest - planned.totalInterest);
	return {
		...planned,
		minOnlyInterest: minOnly.totalInterest,
		interestSaved
	};
}
function LargePurchasesCard() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const profile = useProfile();
	const month = useAppStore((s) => s.activeMonth);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [total, setTotal] = (0, import_react.useState)(0);
	const [months, setMonths] = (0, import_react.useState)(6);
	const [category, setCategory] = (0, import_react.useState)("essential");
	const [fundFromGoalId, setFundFromGoalId] = (0, import_react.useState)("");
	const installment = months > 0 && total > 0 ? total / months : 0;
	const fundGoal = profile.goals.find((g) => g.id === fundFromGoalId);
	function resetForm() {
		setEditingId(null);
		setName("");
		setTotal(0);
		setMonths(6);
		setCategory("essential");
		setFundFromGoalId("");
	}
	function openAdd() {
		resetForm();
		setOpen(true);
	}
	function openEdit(id) {
		const lp = profile.largePurchases.find((x) => x.id === id);
		if (!lp) return;
		setEditingId(id);
		setName(lp.name);
		setTotal(lp.total);
		setMonths(lp.months);
		setCategory(lp.category ?? "essential");
		setFundFromGoalId(lp.fundFromGoalId ?? "");
		setOpen(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "text-lg font-semibold",
			children: t(lang, "budget.largePurchases")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: t(lang, "budget.largeHintSelf")
		}),
		profile.largePurchases.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-8 text-center text-sm text-subtle",
			children: t(lang, "budget.noLarge")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-2",
			children: profile.largePurchases.map((lp) => {
				const prog = largeProgress(lp, month);
				const pct = lp.months > 0 ? prog.dueCount / lp.months * 100 : 0;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md bg-elevated px-3 py-3 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								className: "min-w-0 flex-1 text-left",
								onClick: () => openEdit(lp.id),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-medium",
										children: lp.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted",
										children: t(lang, `budget.${lp.category === "savings" ? "goals" : lp.category === "debt" ? "debtAlloc" : lp.category}`)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [
											formatMoney(installmentOf(lp), currency, lang),
											" × ",
											lp.months
										]
									}),
									lp.fundFromGoalId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-xs text-muted",
										children: [
											t(lang, "budget.fundedFrom", { name: profile.goals.find((g) => g.id === lp.fundFromGoalId)?.name ?? "—" }),
											" · ",
											t(lang, "budget.repayProgress", {
												paid: formatMoney(lp.total - prog.remaining, currency, lang),
												total: formatMoney(lp.total, currency, lang)
											})
										]
									}) : null
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex shrink-0 items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => openEdit(lp.id),
									className: "flex size-11 items-center justify-center text-muted hover:text-fg",
									"aria-label": t(lang, "common.edit"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => useAppStore.getState().removeLarge(lp.id),
									className: "flex size-11 items-center justify-center text-muted hover:text-danger",
									"aria-label": t(lang, "common.delete"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
							value: pct,
							className: "my-2"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [
								prog.completed ? t(lang, "budget.largeDone") : prog.active ? t(lang, "budget.monthOf", {
									n: prog.index + 1,
									total: lp.months
								}) : t(lang, "budget.notStarted"),
								" · ",
								t(lang, "budget.remaining"),
								": ",
								formatMoney(prog.remaining, currency, lang)
							]
						})
					]
				}, lp.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "secondary",
			className: "mt-3 w-full",
			onClick: openAdd,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }),
				" ",
				t(lang, "budget.addLarge")
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: (v) => {
				setOpen(v);
				if (!v) resetForm();
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
				title: editingId ? t(lang, "budget.editLarge") : t(lang, "budget.addLarge"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.largeCategory") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
							value: category,
							onChange: (e) => setCategory(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "essential",
									children: t(lang, "budget.essential")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "flexible",
									children: t(lang, "budget.flexible")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "investing",
									children: t(lang, "budget.investing")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "savings",
									children: t(lang, "budget.goals")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "debt",
									children: t(lang, "budget.debtAlloc")
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.name") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value),
							placeholder: t(lang, "budget.largeNamePh")
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.total") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
								value: total,
								onValue: setTotal
							}, editingId ?? "new-large"),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: t(lang, "budget.amountExprHint")
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.monthsSplit") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 1,
							value: months,
							onChange: (e) => setMonths(Math.max(1, Number(e.target.value) || 1))
						})] }),
						installment > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-md bg-elevated px-3 py-2 text-xs text-muted",
							children: t(lang, "budget.perMonthPreview", {
								amount: formatMoney(installment, currency, lang),
								n: months
							})
						}) : null,
						profile.goals.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.fundFrom") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
								value: fundFromGoalId,
								onChange: (e) => setFundFromGoalId(e.target.value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: t(lang, "budget.fundFromNone")
								}), profile.goals.map((g) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: g.id,
									children: [
										g.name,
										" (",
										formatMoney(g.current, currency, lang),
										")"
									]
								}, g.id))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: t(lang, "budget.fundFromHint")
							}),
							!editingId && fundGoal && total > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-xs text-muted",
								children: [
									fundGoal.name,
									": ",
									formatMoney(fundGoal.current, currency, lang),
									" →",
									" ",
									formatMoney(fundGoal.current - total, currency, lang)
								]
							}) : null
						] }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: () => {
								if (!name.trim() || total <= 0) return;
								if (editingId) useAppStore.getState().updateLarge(editingId, {
									name: name.trim(),
									total,
									months: Math.max(1, months),
									category,
									fundFromGoalId: fundFromGoalId || void 0
								});
								else useAppStore.getState().addLarge({
									name: name.trim(),
									total,
									months: Math.max(1, months),
									startMonth: month,
									category,
									fundFromGoalId: fundFromGoalId || void 0
								});
								resetForm();
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
function RecurringCard() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const profile = useProfile();
	const month = useAppStore((s) => s.activeMonth);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [amount, setAmount] = (0, import_react.useState)(0);
	const [category, setCategory] = (0, import_react.useState)("essential");
	const [freq, setFreq] = (0, import_react.useState)("monthly");
	const suggestions = profile.recurringMemory ?? [];
	function openAdd() {
		setEditingId(null);
		setName("");
		setAmount(0);
		setCategory("essential");
		setFreq("monthly");
		setOpen(true);
	}
	function openEdit(id) {
		const r = profile.recurring.find((x) => x.id === id);
		if (!r) return;
		setEditingId(id);
		setName(r.name);
		setAmount(r.amount);
		setCategory(r.category);
		setFreq(r.frequency ?? "monthly");
		setOpen(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "flex items-center gap-2 text-lg font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "size-5 text-primary" }), t(lang, "budget.recurring")]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: t(lang, "budget.recurringAutoHint")
		}),
		profile.recurring.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "py-8 text-center text-sm text-subtle",
			children: t(lang, "budget.noRecurring")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-2",
			children: profile.recurring.map((r) => {
				const paused = r.active === false;
				const skipped = r.skippedMonths?.includes(month);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-md bg-elevated px-3 py-2 text-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: paused ? "text-muted line-through" : "",
								children: [
									r.name,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted",
										children: ["· ", formatMoney(r.amount, currency, lang)]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "mt-0.5 block text-[0.65rem] uppercase tracking-wide text-muted",
								children: [
									t(lang, FREQ_LABEL[r.frequency ?? "monthly"]),
									" · ",
									paused ? t(lang, "budget.paused") : skipped ? t(lang, "budget.skipped") : t(lang, "budget.appliedAuto")
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => openEdit(r.id),
									className: "flex size-11 items-center justify-center text-muted hover:text-fg",
									"aria-label": t(lang, "common.edit"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => useAppStore.getState().toggleRecurring(r.id, paused),
									className: "flex size-11 items-center justify-center text-muted hover:text-fg",
									"aria-label": paused ? t(lang, "budget.resume") : t(lang, "budget.pause"),
									children: paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => useAppStore.getState().removeRecurring(r.id),
									className: "flex size-11 items-center justify-center text-muted hover:text-danger",
									"aria-label": t(lang, "common.delete"),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
								})
							]
						})]
					})
				}, r.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			variant: "secondary",
			className: "mt-3 w-full",
			onClick: openAdd,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }),
				" ",
				t(lang, "budget.addRecurring")
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: (v) => {
				setOpen(v);
				if (!v) setEditingId(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
				title: editingId ? t(lang, "budget.editRecurring") : t(lang, "budget.addRecurring"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						!editingId && suggestions.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-1.5 text-xs text-muted",
							children: t(lang, "budget.suggestions")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap gap-1.5",
							children: suggestions.slice(0, 8).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "rounded-full bg-elevated px-3 py-1 text-xs hover:bg-card",
								onClick: () => {
									setName(s.name);
									setAmount(s.amount);
									setCategory(s.category);
								},
								children: s.name
							}, s.name))
						})] }) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.name") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: name,
								onChange: (e) => setName(e.target.value),
								list: "recurring-suggestions",
								autoComplete: "off"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("datalist", {
								id: "recurring-suggestions",
								children: suggestions.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { value: s.name }, s.name))
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.total") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
								value: amount,
								onValue: setAmount
							}, editingId ?? "new-recurring"),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-subtle",
								children: t(lang, "budget.amountExprHint")
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.category") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
							value: category,
							onChange: (e) => setCategory(e.target.value),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "essential",
									children: t(lang, "budget.essential")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "investing",
									children: t(lang, "budget.investing")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "flexible",
									children: t(lang, "budget.flexible")
								})
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.frequency") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
							value: freq,
							onChange: (e) => setFreq(e.target.value),
							children: RECURRING_FREQS.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: f,
								children: t(lang, FREQ_LABEL[f])
							}, f))
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: () => {
								if (!name.trim()) return;
								if (editingId) useAppStore.getState().updateRecurring(editingId, {
									name: name.trim(),
									amount,
									category,
									frequency: freq
								});
								else useAppStore.getState().addRecurring({
									name: name.trim(),
									amount,
									category,
									frequency: freq,
									startMonth: month
								});
								setName("");
								setAmount(0);
								setFreq("monthly");
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
function InvestmentCalcCard() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const [principal, setPrincipal] = (0, import_react.useState)(0);
	const [pmt, setPmt] = (0, import_react.useState)(0);
	const [rate, setRate] = (0, import_react.useState)(10);
	const [years, setYears] = (0, import_react.useState)(10);
	const rows = (0, import_react.useMemo)(() => simulate$1({
		principal,
		pmt,
		annualRatePct: rate,
		years,
		periodsPerYear: 12,
		timing: "end"
	}), [
		principal,
		pmt,
		rate,
		years
	]);
	const show = principal > 0 || pmt > 0;
	const last = rows[rows.length - 1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "flex items-center gap-2 text-lg font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-5 text-primary" }), t(lang, "budget.invCalc")]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: t(lang, "budget.invCalcHint")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: t(lang, "budget.initialInv"),
					suffix: currency,
					value: principal,
					onChange: setPrincipal
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: t(lang, "budget.monthlyContrib"),
					suffix: currency,
					value: pmt,
					onChange: setPmt
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NumField, {
					label: t(lang, "budget.annualRate"),
					suffix: "%",
					value: rate,
					onChange: setRate
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-1 text-sm",
					children: [
						t(lang, "budget.invPeriod"),
						": ",
						years
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Slider, {
					min: 1,
					max: 40,
					step: 1,
					value: [years],
					onValueChange: (v) => setYears(v[0] ?? 10)
				})] })
			]
		}),
		!show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 rounded-md bg-elevated px-3 py-3 text-sm text-muted",
			children: t(lang, "budget.invEmpty")
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-2 text-sm text-muted",
				children: [
					t(lang, "budget.finalBalance"),
					":",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-semibold text-fg tabular",
						children: formatMoney(last?.balance ?? 0, currency, lang)
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-40 min-w-0 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: rows,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "year",
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
								dataKey: "balance",
								fill: "var(--color-primary)",
								radius: [
									3,
									3,
									0,
									0
								]
							})
						]
					})
				})
			})]
		})
	] });
}
function NumField({ label, suffix, value, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex overflow-hidden rounded-md bg-elevated card-shadow",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "number",
			className: "h-11 min-w-0 flex-1 bg-transparent px-3 text-sm tabular outline-none",
			value,
			onChange: (e) => onChange(Number(e.target.value) || 0)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex items-center px-3 text-xs text-muted",
			children: suffix
		})]
	})] });
}
function DebtCard() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const profile = useProfile();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editingId, setEditingId] = (0, import_react.useState)(null);
	const [name, setName] = (0, import_react.useState)("");
	const [balance, setBalance] = (0, import_react.useState)(0);
	const [rate, setRate] = (0, import_react.useState)(5);
	const [min, setMin] = (0, import_react.useState)(0);
	const [category, setCategory] = (0, import_react.useState)("essential");
	const avalanche = (0, import_react.useMemo)(() => planPaydown(profile.debts, profile.extraDebtPayment, "avalanche"), [profile.debts, profile.extraDebtPayment]);
	const snowball = (0, import_react.useMemo)(() => planPaydown(profile.debts, profile.extraDebtPayment, "snowball"), [profile.debts, profile.extraDebtPayment]);
	const method = profile.debtMethod;
	const plan = method === "avalanche" ? avalanche : snowball;
	const other = method === "avalanche" ? snowball : avalanche;
	const interestDelta = other.totalInterest - plan.totalInterest;
	const monthsDelta = other.months - plan.months;
	function openAdd() {
		setEditingId(null);
		setName("");
		setBalance(0);
		setRate(5);
		setMin(0);
		setCategory("essential");
		setOpen(true);
	}
	function openEdit(id) {
		const d = profile.debts.find((x) => x.id === id);
		if (!d) return;
		setEditingId(id);
		setName(d.name);
		setBalance(d.balance);
		setRate(d.ratePct);
		setMin(d.minPayment);
		setCategory(d.category ?? "essential");
		setOpen(true);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
			className: "flex items-center gap-2 text-lg font-semibold",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "size-5 text-danger" }), t(lang, "budget.debt")]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted",
			children: t(lang, "budget.debtHint")
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Fold, {
					title: t(lang, "budget.yourDebts"),
					defaultOpen: true,
					children: [profile.debts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-4 text-center text-sm text-subtle",
						children: t(lang, "budget.noDebts")
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2 md:hidden",
						children: profile.debts.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-md bg-card px-3 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "min-w-0 flex-1 py-1 text-left",
									onClick: () => openEdit(d.id),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium",
											children: d.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted",
											children: [
												t(lang, allocI18nKey(d.category)),
												" · ",
												t(lang, "budget.debtMin"),
												" ",
												formatMoney(d.minPayment, currency, lang)
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "mt-0.5 text-xs text-muted tabular",
											children: [
												formatMoney(d.balance, currency, lang),
												" · ",
												d.ratePct,
												"%"
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex shrink-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => openEdit(d.id),
										className: "flex size-11 items-center justify-center text-muted hover:text-fg",
										"aria-label": t(lang, "common.edit"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => useAppStore.getState().removeDebt(d.id),
										className: "flex size-11 items-center justify-center text-muted hover:text-danger",
										"aria-label": t(lang, "common.delete"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
									})]
								})]
							})
						}, d.id))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "hidden overflow-x-auto md:block",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 font-medium",
										children: t(lang, "budget.debtName")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 font-medium",
										children: t(lang, "budget.category")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 font-medium",
										children: t(lang, "budget.debtBalance")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 font-medium",
										children: t(lang, "budget.debtRate")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 font-medium",
										children: t(lang, "budget.debtMin")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: profile.debts.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2",
										children: d.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-2 text-muted",
										children: t(lang, allocI18nKey(d.category))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "tabular",
										children: formatMoney(d.balance, currency, lang)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "tabular",
										children: [d.ratePct, "%"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "tabular",
										children: formatMoney(d.minPayment, currency, lang)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex justify-end",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => openEdit(d.id),
											className: "flex size-11 items-center justify-center text-muted hover:text-fg",
											"aria-label": t(lang, "common.edit"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											onClick: () => useAppStore.getState().removeDebt(d.id),
											className: "flex size-11 items-center justify-center text-muted hover:text-danger",
											"aria-label": t(lang, "common.delete"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
										})]
									}) })
								]
							}, d.id)) })]
						})
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "secondary",
						size: "sm",
						className: "mt-2 w-full",
						onClick: openAdd,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }),
							" ",
							t(lang, "budget.addDebt")
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Fold, {
					title: t(lang, "budget.strategy"),
					defaultOpen: true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.payoffMethod") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodButton, {
								active: method === "avalanche",
								title: t(lang, "budget.avalanche"),
								subtitle: t(lang, "budget.avalancheHint"),
								onClick: () => useAppStore.getState().setDebtMethod("avalanche")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MethodButton, {
								active: method === "snowball",
								title: t(lang, "budget.snowball"),
								subtitle: t(lang, "budget.snowballHint"),
								onClick: () => useAppStore.getState().setDebtMethod("snowball")
							})]
						}),
						profile.debts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanPreview, {
								label: t(lang, "budget.avalanche"),
								plan: avalanche,
								active: method === "avalanche",
								currency,
								lang,
								onClick: () => useAppStore.getState().setDebtMethod("avalanche")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlanPreview, {
								label: t(lang, "budget.snowball"),
								plan: snowball,
								active: method === "snowball",
								currency,
								lang,
								onClick: () => useAppStore.getState().setDebtMethod("snowball")
							})]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "mt-3",
							children: t(lang, "budget.extraPayment")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex overflow-hidden rounded-md bg-card card-shadow",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
								className: "h-11 min-w-0 flex-1 rounded-none bg-transparent",
								value: profile.extraDebtPayment,
								onValue: (n) => useAppStore.getState().setExtraPayment(n)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "flex items-center px-3 text-xs text-muted",
								children: currency
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted",
							children: t(lang, "budget.extraHint")
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fold, {
					title: t(lang, "budget.paydownPlan"),
					defaultOpen: true,
					children: profile.debts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "py-4 text-center text-sm text-subtle",
						children: t(lang, "budget.noDebts")
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: plan.debtFree ? t(lang, "budget.debtFreeIn", { months: plan.months }) : t(lang, "budget.debtNotRetired")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-muted",
								children: [
									t(lang, "budget.extraGoesTo"),
									": ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-fg",
										children: plan.schedule[0]?.extraTo ?? "—"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-muted",
								children: [
									t(lang, "budget.interestPaid"),
									": ",
									formatMoney(plan.totalInterest, currency, lang)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-muted",
								children: [
									t(lang, "budget.totalPaid"),
									": ",
									formatMoney(plan.totalPaid, currency, lang)
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-success",
								children: [
									t(lang, "budget.interestSaved"),
									": ",
									formatMoney(plan.interestSaved, currency, lang)
								]
							}),
							interestDelta > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 rounded-md bg-success/10 px-3 py-2 text-xs text-success",
								children: [t(lang, "budget.cheaperBy", { amount: formatMoney(interestDelta, currency, lang) }), monthsDelta > 0 ? ` · ${t(lang, "budget.fasterBy", { n: monthsDelta })}` : ""]
							}) : Math.abs(interestDelta) <= 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: t(lang, "budget.samePlan")
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 h-48 min-w-0 overflow-hidden",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
									width: "100%",
									height: "100%",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
										data: Array.from({ length: Math.max(avalanche.schedule.length, snowball.schedule.length) }, (_, i) => ({
											month: i + 1,
											avalanche: avalanche.schedule[i]?.remaining ?? 0,
											snowball: snowball.schedule[i]?.remaining ?? 0
										})),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
												vertical: false,
												stroke: "var(--color-border)",
												strokeDasharray: "3 3"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
												dataKey: "month",
												tick: {
													fill: "var(--color-muted)",
													fontSize: 11
												},
												axisLine: false,
												tickLine: false
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
												tick: {
													fill: "var(--color-muted)",
													fontSize: 10
												},
												axisLine: false,
												tickLine: false,
												width: 40,
												tickFormatter: (v) => `${Math.round(Number(v) / 1e3)}k`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
												formatter: (v, name) => [formatMoney(Number(v), currency, lang), name === "avalanche" ? t(lang, "budget.avalanche") : t(lang, "budget.snowball")],
												contentStyle: {
													background: "var(--color-card)",
													border: "1px solid var(--color-border)"
												}
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
												type: "monotone",
												dataKey: "avalanche",
												stroke: "var(--color-primary)",
												fill: "var(--color-primary)",
												fillOpacity: method === "avalanche" ? .25 : .08,
												strokeWidth: method === "avalanche" ? 2.5 : 1.5,
												isAnimationActive: false
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
												type: "monotone",
												dataKey: "snowball",
												stroke: "var(--color-warning)",
												fill: "var(--color-warning)",
												fillOpacity: method === "snowball" ? .25 : .08,
												strokeWidth: method === "snowball" ? 2.5 : 1.5,
												isAnimationActive: false
											})
										]
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 flex justify-center gap-4 text-[0.65rem] text-muted",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-sm bg-primary" }), t(lang, "budget.avalanche")]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-sm bg-warning" }), t(lang, "budget.snowball")]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-xs text-muted",
								children: t(lang, "budget.fullSchedule", { n: plan.schedule.length })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 max-h-80 space-y-1 overflow-auto text-xs",
								children: plan.schedule.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex justify-between rounded bg-card px-2 py-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [m.label, m.extraTo ? ` → ${m.extraTo}` : ""] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "tabular",
										children: formatMoney(m.remaining, currency, lang)
									})]
								}, m.month))
							})
						]
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: (v) => {
				setOpen(v);
				if (!v) setEditingId(null);
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
				title: editingId ? t(lang, "budget.editDebt") : t(lang, "budget.addDebt"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.largeCategory") }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
								value: category,
								onChange: (e) => setCategory(e.target.value),
								"aria-label": t(lang, "budget.largeCategory"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "essential",
										children: t(lang, "budget.essential")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "flexible",
										children: t(lang, "budget.flexible")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "investing",
										children: t(lang, "budget.investing")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "savings",
										children: t(lang, "budget.goals")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "debt",
										children: t(lang, "budget.debtAlloc")
									})
								]
							}),
							min > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 rounded-md bg-elevated px-3 py-2 text-xs text-muted",
								children: t(lang, "budget.debtMinPreview", {
									amount: formatMoney(min, currency, lang),
									category: t(lang, allocI18nKey(category))
								})
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted",
								children: t(lang, "budget.debtCategoryHint")
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.name") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: name,
							onChange: (e) => setName(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.debtBalance") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
							value: balance,
							onValue: setBalance
						}, `${editingId ?? "new"}-bal`)] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.debtRate") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: rate,
							onChange: (e) => setRate(Number(e.target.value) || 0)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "budget.debtMin") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
							value: min,
							onValue: setMin
						}, `${editingId ?? "new"}-min`)] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "w-full",
							onClick: () => {
								if (!name.trim()) return;
								if (editingId) useAppStore.getState().updateDebt(editingId, {
									name: name.trim(),
									balance,
									ratePct: rate,
									minPayment: min,
									category
								});
								else useAppStore.getState().addDebt({
									name: name.trim(),
									balance,
									ratePct: rate,
									minPayment: min,
									category
								});
								setName("");
								setBalance(0);
								setRate(5);
								setMin(0);
								setCategory("essential");
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
function MethodButton({ active, title, subtitle, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: active ? "rounded-lg bg-primary px-3 py-3 text-left text-primary-fg" : "rounded-lg bg-card px-3 py-3 text-left hover:bg-elevated",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: active ? "mt-1 text-[0.7rem] text-primary-fg/80" : "mt-1 text-[0.7rem] text-muted",
			children: subtitle
		})]
	});
}
function PlanPreview({ label, plan, active, currency, lang, onClick }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		className: active ? "rounded-lg border border-primary bg-primary/10 px-3 py-3 text-left" : "rounded-lg border border-border bg-card px-3 py-3 text-left",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-medium text-muted",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm font-semibold",
				children: plan.debtFree ? t(lang, "budget.monthsShort", { n: plan.months }) : "—"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-0.5 text-xs text-muted",
				children: [
					t(lang, "budget.extraGoesTo"),
					": ",
					plan.schedule[0]?.extraTo ?? "—"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-0.5 text-xs text-muted",
				children: [
					t(lang, "budget.interestCost"),
					": ",
					formatMoney(plan.totalInterest, currency, lang)
				]
			})
		]
	});
}
function PlannerView() {
	const lang = useAppStore((s) => s.lang);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IncomeCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LargePurchasesCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecurringCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryCard, {
				id: "essential",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "size-5" }),
				title: t(lang, "budget.essential"),
				hint: t(lang, "budget.essentialHint")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryCard, {
				id: "investing",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "size-5" }),
				title: t(lang, "budget.investing"),
				hint: t(lang, "budget.investingHint")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvestmentCalcCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: t(lang, "budget.fullCalc")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 mb-4 text-sm text-muted",
					children: t(lang, "budget.fullCalcHint")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalculatorView, { embedded: true })
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoalsCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DebtCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DebtAllocCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryCard, {
				id: "flexible",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBag, { className: "size-5" }),
				title: t(lang, "budget.flexible"),
				hint: t(lang, "budget.flexibleHint")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthlySummary, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HealthCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TipCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YearlyCard, {})
		]
	});
}
//#endregion
export { PlannerView as t };

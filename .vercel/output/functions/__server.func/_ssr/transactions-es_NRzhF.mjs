import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { F as txsInMonth, L as useAppStore, N as t, P as txSigned, g as formatMoney, s as cn, u as dateInMonth, x as isoToday, z as useProfile } from "./store-DJ-NhLM1.mjs";
import { t as Button } from "./button-BfLOEi7q.mjs";
import { t as Label } from "./label-CXJ1augD.mjs";
import { h as Plus, l as Trash2 } from "../_libs/lucide-react.mjs";
import { n as Dialog, r as DialogContent, t as AmountExprInput } from "./dialog-CNqxeaFt.mjs";
import { t as Input } from "./input-BWhrm__Q.mjs";
import { t as NativeSelect } from "./native-select-D218FZZi.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transactions-es_NRzhF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TYPES = [
	"income",
	"expense",
	"saving",
	"investment",
	"debt-payment"
];
function typeToCategory(type, fallback) {
	if (type === "income") return "income";
	if (type === "investment") return "investing";
	if (type === "saving") return "savings";
	if (type === "debt-payment") return "debt";
	if (fallback === "essential" || fallback === "flexible") return fallback;
	return "essential";
}
function TxDialog({ open, onOpenChange, initial }) {
	const lang = useAppStore((s) => s.lang);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const [name, setName] = (0, import_react.useState)(initial?.name ?? "");
	const [amount, setAmount] = (0, import_react.useState)(initial?.amount ?? 0);
	const [type, setType] = (0, import_react.useState)(initial?.type ?? "expense");
	const [category, setCategory] = (0, import_react.useState)(initial?.category ?? "essential");
	const [date, setDate] = (0, import_react.useState)(initial?.date ?? (isoToday().startsWith(month) ? isoToday() : dateInMonth(month, 1)));
	const [methodId, setMethodId] = (0, import_react.useState)(initial?.methodId ?? "");
	const [notes, setNotes] = (0, import_react.useState)(initial?.notes ?? "");
	function submit() {
		if (!name.trim() || amount <= 0) return;
		const cat = typeToCategory(type, category);
		const payload = {
			name: name.trim(),
			amount,
			type,
			category: cat,
			date,
			methodId: methodId || void 0,
			notes: notes.trim() || void 0
		};
		if (initial) useAppStore.getState().updateTransaction(initial.id, payload);
		else useAppStore.getState().addTransaction(payload);
		onOpenChange(false);
		setName("");
		setAmount(0);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
			title: t(lang, initial ? "tx.edit" : "tx.add"),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "common.name") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: name,
						onChange: (e) => setName(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "common.amount") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AmountExprInput, {
							value: amount,
							onValue: setAmount
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-subtle",
							children: t(lang, "budget.amountExprHint")
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "common.type") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: type,
						onChange: (e) => {
							const next = e.target.value;
							setType(next);
							setCategory(typeToCategory(next, category));
						},
						children: TYPES.map((ty) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: ty,
							children: t(lang, `tx.${ty === "debt-payment" ? "debt" : ty}`)
						}, ty))
					})] }),
					type === "expense" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "common.category") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
						value: category,
						onChange: (e) => setCategory(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "essential",
							children: t(lang, "budget.essential")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "flexible",
							children: t(lang, "budget.flexible")
						})]
					})] }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "common.date") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						type: "date",
						value: date,
						onChange: (e) => setDate(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "common.method") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
						value: methodId,
						onChange: (e) => setMethodId(e.target.value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: t(lang, "common.all")
						}), profile.paymentMethods.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: m.id,
							children: m.name
						}, m.id))]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t(lang, "common.notes") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: notes,
						onChange: (e) => setNotes(e.target.value)
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						onClick: submit,
						children: t(lang, "common.save")
					})
				]
			})
		})
	});
}
function TransactionsView() {
	const lang = useAppStore((s) => s.lang);
	const currency = useAppStore((s) => s.currency);
	const month = useAppStore((s) => s.activeMonth);
	const profile = useProfile();
	const [q, setQ] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("all");
	const [method, setMethod] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)();
	const list = (0, import_react.useMemo)(() => {
		return txsInMonth(profile, month).filter((tx) => type === "all" ? true : tx.type === type).filter((tx) => method === "all" ? true : tx.methodId === method).filter((tx) => q.trim() ? `${tx.name} ${tx.notes ?? ""}`.toLowerCase().includes(q.toLowerCase()) : true).sort((a, b) => b.date.localeCompare(a.date) || b.name.localeCompare(a.name));
	}, [
		profile,
		month,
		type,
		method,
		q
	]);
	const income = list.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
	const out = list.filter((t) => t.type !== "income").reduce((s, t) => s + t.amount, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold tracking-tight",
					children: t(lang, "tx.title")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "shrink-0",
					onClick: () => {
						setEditing(void 0);
						setOpen(true);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "hidden sm:inline",
							children: t(lang, "tx.add")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "sm:hidden",
							children: t(lang, "common.add")
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-card p-3 card-shadow",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: t(lang, "tx.income")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "tabular text-success font-semibold",
						children: formatMoney(income, currency, lang)
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl bg-card p-3 card-shadow",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: t(lang, "tx.net")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("tabular font-semibold", income - out < 0 ? "text-danger" : "text-fg"),
						children: formatMoney(income - out, currency, lang)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: t(lang, "common.search"),
				value: q,
				onChange: (e) => setQ(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					value: type,
					onChange: (e) => setType(e.target.value),
					className: "flex-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "all",
							children: t(lang, "common.all")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "income",
							children: t(lang, "tx.income")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "expense",
							children: t(lang, "tx.expense")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "saving",
							children: t(lang, "tx.saving")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "investment",
							children: t(lang, "tx.investment")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "debt-payment",
							children: t(lang, "tx.debt")
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(NativeSelect, {
					value: method,
					onChange: (e) => setMethod(e.target.value),
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "all",
						children: t(lang, "common.method")
					}), profile.paymentMethods.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: m.id,
						children: m.name
					}, m.id))]
				})]
			}),
			list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-12 text-center text-sm text-subtle",
				children: t(lang, "tx.empty")
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "divide-y divide-border overflow-hidden rounded-2xl bg-card card-shadow",
				children: list.map((tx) => {
					const signed = txSigned(tx);
					const pm = profile.paymentMethods.find((m) => m.id === tx.methodId);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex min-h-14 items-center gap-2 px-3 py-2 sm:px-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								className: "min-h-11 min-w-0 flex-1 text-left",
								onClick: () => {
									setEditing(tx);
									setOpen(true);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-medium",
									children: tx.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted",
									children: [tx.date, pm ? ` · ${pm.name}` : ""]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: cn("shrink-0 tabular text-sm font-medium", signed >= 0 ? "text-success" : "text-fg"),
								children: [signed >= 0 ? "+" : "", formatMoney(signed, currency, lang)]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "flex size-11 shrink-0 items-center justify-center text-muted hover:text-danger",
								"aria-label": t(lang, "common.delete"),
								onClick: () => {
									if (window.confirm(t(lang, "tx.confirmDelete"))) useAppStore.getState().deleteTransaction(tx.id);
								},
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}, tx.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TxDialog, {
				open,
				onOpenChange: setOpen,
				initial: editing
			}, editing?.id ?? "new")
		]
	});
}
function TransactionsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TransactionsView, {});
}
//#endregion
export { TransactionsPage as component };

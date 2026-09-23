import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { L as useAppStore, N as t, i as LANGS, s as cn, t as CURRENCIES, z as useProfile } from "./store-DJ-NhLM1.mjs";
import { t as Button } from "./button-BfLOEi7q.mjs";
import { n as Panel } from "./panel-Btdc78ax.mjs";
import { a as UserMinus, b as Moon, h as Plus, i as UserPlus, l as Trash2, p as Settings, r as User, u as Sun } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-BWhrm__Q.mjs";
import { t as NativeSelect } from "./native-select-D218FZZi.mjs";
import { n as SpreadsheetImportButtons } from "./router-DZfxSB0e.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-DozjPMby.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Switch({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
		className: cn("peer inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-elevated card-shadow transition-colors", "data-[state=checked]:bg-primary", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: "pointer-events-none block size-5 translate-x-1 rounded-full bg-fg shadow-sm transition-transform data-[state=checked]:translate-x-6 data-[state=checked]:bg-primary-fg" })
	});
}
function SettingsView() {
	const lang = useAppStore((s) => s.lang);
	const theme = useAppStore((s) => s.theme);
	const currency = useAppStore((s) => s.currency);
	const advanced = useAppStore((s) => s.advancedView);
	const profiles = useAppStore((s) => s.profiles);
	const activeId = useAppStore((s) => s.activeProfileId);
	const profile = useProfile();
	const [payName, setPayName] = (0, import_react.useState)("");
	const [payColor, setPayColor] = (0, import_react.useState)("#6e7bff");
	const [rename, setRename] = (0, import_react.useState)(profile.name);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto flex w-full max-w-xl flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mb-4 flex items-center gap-2 text-2xl font-semibold tracking-tight",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-6 text-muted" }), t(lang, "settings.title")]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-sm font-medium",
					children: t(lang, "budget.budgetProfile")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
								value: activeId,
								onChange: (e) => useAppStore.getState().setActiveProfile(e.target.value),
								className: "pl-9",
								children: profiles.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: p.id,
									children: p.name
								}, p.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							size: "icon",
							"aria-label": t(lang, "budget.addProfile"),
							onClick: () => {
								const name = window.prompt(t(lang, "budget.addProfile"), t(lang, "budget.profileDefaultName"));
								if (name) useAppStore.getState().addProfile(name);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "danger",
							size: "icon",
							"aria-label": t(lang, "budget.removeProfile"),
							onClick: () => {
								if (window.confirm(t(lang, "budget.confirmDeleteProfile"))) useAppStore.getState().removeProfile(activeId);
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMinus, { className: "size-4" })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						value: rename,
						onChange: (e) => setRename(e.target.value),
						"aria-label": t(lang, "settings.rename")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => {
							if (rename.trim()) useAppStore.getState().renameProfile(activeId, rename.trim());
						},
						children: t(lang, "common.save")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: currency,
						onChange: (e) => useAppStore.getState().setCurrency(e.target.value),
						"aria-label": t(lang, "budget.currency"),
						children: CURRENCIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.code,
							children: c.label
						}, c.code))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NativeSelect, {
						value: lang,
						onChange: (e) => useAppStore.getState().setLang(e.target.value),
						"aria-label": t(lang, "budget.language"),
						children: LANGS.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: l.code,
							children: l.label
						}, l.code))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-4 flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-4 text-muted" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: theme === "dark",
							onCheckedChange: (v) => useAppStore.getState().setTheme(v ? "dark" : "light"),
							"aria-label": t(lang, "settings.theme")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-4 text-muted" })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm",
						children: t(lang, "budget.advanced")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
						checked: advanced,
						onCheckedChange: (v) => useAppStore.getState().setAdvanced(v)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-center text-sm font-medium",
					children: t(lang, "budget.paymentMethods")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: profile.paymentMethods.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between rounded-md bg-elevated px-3 py-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2.5 rounded-full",
								style: { background: m.color }
							}), m.name]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "p-1 text-muted hover:text-danger",
							onClick: () => useAppStore.getState().removePaymentMethod(m.id),
							"aria-label": t(lang, "budget.delete"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})]
					}, m.id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: t(lang, "budget.addPayment"),
							value: payName,
							onChange: (e) => setPayName(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "color",
							value: payColor,
							onChange: (e) => setPayColor(e.target.value),
							className: "h-11 w-11 shrink-0 rounded-md bg-elevated p-1",
							"aria-label": "Color"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "icon",
							onClick: () => {
								if (!payName.trim()) return;
								useAppStore.getState().addPaymentMethod(payName.trim(), payColor);
								setPayName("");
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-1 text-lg font-semibold",
					children: t(lang, "import.excel")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-muted",
					children: t(lang, "setup.uploadHint")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpreadsheetImportButtons, {})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: t(lang, "settings.privacy")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "sm",
					onClick: () => useAppStore.getState().restoreSample(),
					children: t(lang, "budget.loadSample")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "danger",
					size: "sm",
					onClick: () => {
						if (window.confirm(t(lang, "budget.confirmReset"))) useAppStore.getState().resetProfile();
					},
					children: t(lang, "budget.reset")
				})]
			})
		]
	});
}
function SettingsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsView, {});
}
//#endregion
export { SettingsPage as component };

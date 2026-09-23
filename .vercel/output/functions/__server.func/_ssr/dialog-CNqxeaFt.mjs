import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, o as DialogTitle, r as DialogContent$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { j as roundMoney, s as cn } from "./store-DJ-NhLM1.mjs";
import { t as X } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dialog-CNqxeaFt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Sums a typed expression like 4000+2000 or 4000+2000-150.50. Returns null if invalid. */
function evalAmountExpr(raw) {
	const cleaned = raw.trim().replace(/\s+/g, "").replace(/,/g, ".");
	if (!cleaned) return 0;
	if (!/^[+-]?\d+(\.\d+)?([+-]\d+(\.\d+)?)*$/.test(cleaned)) return null;
	const parts = cleaned.match(/[+-]?\d+(?:\.\d+)?/g);
	if (!parts || parts.length === 0) return null;
	const sum = parts.reduce((s, p) => s + Number(p), 0);
	return Number.isFinite(sum) ? roundMoney(sum) : null;
}
/** Text amount field that accepts chained sums like 45+30+12, same as net income. */
function AmountExprInput({ value, onValue, className, id, placeholder }) {
	const [draft, setDraft] = (0, import_react.useState)(null);
	const shown = draft ?? (value ? String(value) : "");
	function apply(raw) {
		const parsed = evalAmountExpr(raw);
		if (parsed !== null) onValue(parsed);
		setDraft(null);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		id,
		type: "text",
		inputMode: "decimal",
		autoComplete: "off",
		spellCheck: false,
		placeholder,
		className: cn("h-11 w-full rounded-md bg-elevated px-3 text-base text-fg tabular outline-none md:text-sm", "placeholder:text-subtle card-shadow focus-visible:ring-2 focus-visible:ring-ring/70", className),
		value: shown,
		onChange: (e) => {
			const raw = e.target.value;
			setDraft(raw);
			const parsed = evalAmountExpr(raw);
			if (parsed !== null) onValue(parsed);
		},
		onBlur: (e) => apply(e.target.value),
		onKeyDown: (e) => {
			if (e.key === "Enter") e.currentTarget.blur();
		}
	});
}
var Dialog = Dialog$1;
function DialogContent({ className, children, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-bg/70 data-[state=open]:animate-[fadeIn_150ms_ease-out]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed z-50 bg-card text-fg card-shadow focus:outline-none", "inset-x-0 bottom-0 top-auto flex max-h-[min(92dvh,44rem)] w-full flex-col", "rounded-t-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-md:sheet-in", "md:inset-auto md:top-1/2 md:left-1/2 md:w-[min(100%-1.5rem,28rem)] md:max-h-[min(90vh,40rem)]", "md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:pb-5", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto mb-3 h-1 w-10 rounded-full bg-border md:hidden",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "text-base font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogClose, {
					className: "flex size-11 shrink-0 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-fg",
					"aria-label": "Close",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 overflow-y-auto overscroll-contain",
				children
			})
		]
	})] });
}
//#endregion
export { evalAmountExpr as i, Dialog as n, DialogContent as r, AmountExprInput as t };

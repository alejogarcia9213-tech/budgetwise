import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { s as cn } from "./store-DJ-NhLM1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/panel-Btdc78ax.js
var import_jsx_runtime = require_jsx_runtime();
function Panel({ children, className, id }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id,
		className: cn("rounded-2xl bg-card p-4 card-shadow md:p-5", className),
		children
	});
}
function Row({ label, value, tone }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-3 border-t border-border py-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "min-w-0 text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("shrink-0 tabular font-medium", tone === "danger" && "text-danger", tone === "success" && "text-success", tone === "warning" && "text-warning"),
			children: value
		})]
	});
}
function Fold({ title, defaultOpen, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
		className: "rounded-lg bg-elevated",
		open: defaultOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
			className: "flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-left font-medium [&::-webkit-details-marker]:hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 text-xs text-muted",
				children: "▾"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "px-4 pb-4",
			children
		})]
	});
}
//#endregion
export { Panel as n, Row as r, Fold as t };

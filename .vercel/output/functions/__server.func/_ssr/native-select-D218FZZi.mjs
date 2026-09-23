import { i as __toESM } from "../_runtime.mjs";
import { o as require_jsx_runtime, s as require_react } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { s as cn } from "./store-DJ-NhLM1.mjs";
import { A as ChevronDown } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/native-select-D218FZZi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function optionList(children) {
	return import_react.Children.toArray(children).flatMap((child) => {
		if (!(0, import_react.isValidElement)(child)) return [];
		if (child.type === "option") {
			const props = child.props;
			return [{
				value: String(props.value ?? ""),
				label: props.children
			}];
		}
		return [];
	});
}
function NativeSelect({ className, children, value, onChange, disabled, ...rest }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const rootRef = (0, import_react.useRef)(null);
	const options = optionList(children);
	const current = options.find((o) => o.value === String(value)) ?? options[0];
	const ariaLabel = rest["aria-label"];
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
		className: "relative",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
					...rest,
					disabled,
					value,
					"aria-label": ariaLabel,
					onChange: (e) => onChange?.({ target: { value: e.target.value } }),
					className: cn("h-11 w-full appearance-none rounded-md bg-elevated px-3 pr-9 text-base text-fg outline-none card-shadow", "focus-visible:ring-2 focus-visible:ring-ring/70", "disabled:opacity-50", className),
					children
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-60" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				disabled,
				"aria-label": ariaLabel,
				"aria-haspopup": "listbox",
				"aria-expanded": open,
				onClick: () => setOpen((v) => !v),
				className: cn("hidden h-11 w-full items-center justify-between gap-2 rounded-md bg-elevated px-3 pr-3 text-left text-sm text-fg outline-none card-shadow md:flex", "focus-visible:ring-2 focus-visible:ring-ring/70", "disabled:opacity-50", className),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 truncate",
					children: current?.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 shrink-0 opacity-60 transition-transform", open && "rotate-180") })]
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				role: "listbox",
				className: "absolute z-30 mt-1 hidden max-h-64 w-full overflow-auto rounded-md bg-card py-1 text-sm text-fg card-shadow md:block",
				children: options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					role: "option",
					"aria-selected": o.value === String(value),
					className: cn("flex min-h-11 w-full px-3 py-2.5 text-left hover:bg-elevated", o.value === String(value) && "bg-elevated text-primary"),
					onClick: () => {
						onChange?.({ target: { value: o.value } });
						setOpen(false);
					},
					children: o.label
				}) }, o.value))
			}) : null
		]
	});
}
//#endregion
export { NativeSelect as t };

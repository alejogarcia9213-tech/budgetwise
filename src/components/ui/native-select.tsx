import { ChevronDown } from "lucide-react";
import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  onChange?: (e: { target: { value: string } }) => void;
  children: ReactNode;
};

function optionList(children: ReactNode): { value: string; label: ReactNode }[] {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];
    if (child.type !== "option") return [];
    const props = child.props as { value?: string | number; children?: ReactNode };
    return [{ value: props.value == null ? "" : String(props.value), label: props.children }];
  });
}

export function NativeSelect({ className, children, value, onChange, disabled, ...rest }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const options = optionList(children);
  const current = options.find((o) => o.value === String(value)) ?? options[0];
  const ariaLabel = rest["aria-label"];

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative md:hidden">
        <select
          {...rest}
          disabled={disabled}
          value={value}
          aria-label={ariaLabel}
          onChange={(e) => onChange?.({ target: { value: e.target.value } })}
          className={cn(
            "h-11 w-full appearance-none rounded-md bg-elevated px-3 pr-9 text-base text-fg outline-none card-shadow",
            "focus-visible:ring-2 focus-visible:ring-ring/70",
            "disabled:opacity-50",
            className,
          )}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 opacity-60" />
      </div>

      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "hidden h-11 w-full items-center justify-between gap-2 rounded-md bg-elevated px-3 pr-3 text-left text-sm text-fg outline-none card-shadow md:flex",
          "focus-visible:ring-2 focus-visible:ring-ring/70",
          "disabled:opacity-50",
          className,
        )}
      >
        <span className="min-w-0 truncate">{current?.label}</span>
        <ChevronDown className={cn("size-4 shrink-0 opacity-60 transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <ul
          role="listbox"
          className="absolute z-30 mt-1 hidden max-h-64 w-full overflow-auto rounded-md bg-card py-1 text-sm text-fg card-shadow md:block"
        >
          {options.map((o, i) => (
            <li key={`${i}:${o.value}`}>
              <button
                type="button"
                role="option"
                aria-selected={o.value === String(value)}
                className={cn(
                  "flex min-h-11 w-full px-3 py-2.5 text-left hover:bg-elevated",
                  o.value === String(value) && "bg-elevated text-primary",
                )}
                onClick={() => {
                  onChange?.({ target: { value: o.value } });
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
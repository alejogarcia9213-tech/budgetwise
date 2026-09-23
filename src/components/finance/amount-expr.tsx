import { useState } from "react";
import { evalAmountExpr } from "@/lib/expr";
import { cn } from "@/lib/utils";

/** Text amount field that accepts chained sums like 45+30+12, same as net income. */
export function AmountExprInput({
  value,
  onValue,
  className,
  id,
  placeholder,
}: {
  value: number;
  onValue: (n: number) => void;
  className?: string;
  id?: string;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (value ? String(value) : "");

  function apply(raw: string) {
    const parsed = evalAmountExpr(raw);
    if (parsed !== null) onValue(parsed);
    setDraft(null);
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="text"
      autoComplete="off"
      spellCheck={false}
      placeholder={placeholder}
      className={cn(
        "h-11 w-full rounded-md bg-elevated px-3 text-base text-fg tabular outline-none md:text-sm",
        "placeholder:text-subtle card-shadow focus-visible:ring-2 focus-visible:ring-ring/70",
        className,
      )}
      value={shown}
      onChange={(e) => {
        const raw = e.target.value;
        setDraft(raw);
        const parsed = evalAmountExpr(raw);
        if (parsed !== null) onValue(parsed);
      }}
      onBlur={(e) => apply(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
      }}
    />
  );
}

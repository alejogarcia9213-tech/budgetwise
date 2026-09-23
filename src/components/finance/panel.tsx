import type { CSSProperties, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export type CardAccent =
  | "income"
  | "commit"
  | "essential"
  | "invest"
  | "fun"
  | "goals"
  | "debt"
  | "review"
  | "tools";

const ACCENT_COLOR: Record<CardAccent, string> = {
  income: "#6E7BFF",
  commit: "#8B95FF",
  essential: "#6E7BFF",
  invest: "#13C636",
  fun: "#F5A623",
  goals: "#13C636",
  debt: "#FF6B7A",
  review: "#3D4478",
  tools: "#6B7190",
};

export function Panel({
  children,
  className,
  id,
  fold,
  foldTitle,
  defaultOpen = false,
  accent,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  fold?: string;
  foldTitle?: string;
  defaultOpen?: boolean;
  accent?: CardAccent;
}) {
  const openMap = useAppStore((s) => s.cardOpen);
  const open = fold ? (openMap[fold] ?? defaultOpen) : true;
  const accentStyle: CSSProperties | undefined = accent
    ? { borderLeftColor: ACCENT_COLOR[accent] }
    : undefined;

  if (!fold) {
    return (
      <section
        id={id}
        style={accentStyle}
        className={cn(
          "rounded-2xl bg-card p-4 card-shadow md:p-5",
          accent && "border-l-[3px]",
          className,
        )}
      >
        {children}
      </section>
    );
  }

  return (
    <section
      id={id}
      style={accentStyle}
      className={cn("rounded-2xl bg-card card-shadow", accent && "border-l-[3px]", className)}
    >
      <button
        type="button"
        className="flex w-full min-h-12 items-center justify-between gap-3 px-4 py-3 text-left md:px-5"
        onClick={() => useAppStore.getState().setCardOpen(fold, !open)}
        aria-expanded={open}
      >
        <span className="text-lg font-semibold">{foldTitle}</span>
        <ChevronDown className={cn("size-5 shrink-0 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="px-4 pb-4 md:px-5 md:pb-5 [&_.fold-head]:hidden [&_h2.fold-title]:hidden">
          {children}
        </div>
      ) : null}
    </section>
  );
}

export function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "danger" | "success" | "warning";
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-border py-3 text-sm">
      <span className="min-w-0 text-muted">{label}</span>
      <span
        className={cn(
          "shrink-0 tabular font-medium",
          tone === "danger" && "text-danger",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </span>
    </div>
  );
}

export function Fold({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="rounded-lg bg-elevated" open={defaultOpen}>
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-left font-medium [&::-webkit-details-marker]:hidden">
        <span>{title}</span>
        <span className="shrink-0 text-xs text-muted">▾</span>
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
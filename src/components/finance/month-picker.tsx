import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { monthKeyFromParts, monthNames, monthTitle, nextMonthKey, prevMonthKey, yearOf } from "@/lib/dates";
import { LANGS, t, type Lang } from "@/lib/i18n";
import { CURRENCIES, type CurrencyCode } from "@/lib/money";
import { useAppStore, useProfile } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MonthPicker({ compact = false }: { compact?: boolean }) {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const setMonth = useAppStore((s) => s.setMonth);
  const profiles = useAppStore((s) => s.profiles);
  const activeId = useAppStore((s) => s.activeProfileId);
  const profile = useProfile();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(() => Number(yearOf(month)));
  const rootRef = useRef<HTMLDivElement>(null);
  const names = monthNames(lang);
  const selectedMonth = Number(month.slice(5));

  useEffect(() => {
    setYear(Number(yearOf(month)));
  }, [month]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={rootRef} data-tour="tour-period" className="relative min-w-0 w-full">
      {compact ? (
        <div className="flex flex-col gap-1.5">
          <div className="flex min-w-0 items-center gap-1.5">
            <Link to="/" aria-label={t(lang, "appName")} className="shrink-0">
              <LogoMark className="size-8" />
            </Link>
            <select
              id="bw-profile"
              value={activeId}
              onChange={(e) => useAppStore.getState().setActiveProfile(e.target.value)}
              className="h-9 min-w-0 flex-1 truncate rounded-md bg-elevated px-2 text-sm font-medium outline-none card-shadow"
              aria-label={t(lang, "budget.budgetProfile")}
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={currency}
              onChange={(e) => useAppStore.getState().setCurrency(e.target.value as CurrencyCode)}
              className="h-9 w-[6.25rem] shrink-0 rounded-md bg-elevated px-1 text-xs font-medium outline-none card-shadow"
              aria-label={t(lang, "budget.currency")}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} {c.symbol}
                </option>
              ))}
            </select>
            <select
              value={lang}
              onChange={(e) => useAppStore.getState().setLang(e.target.value as Lang)}
              className="h-9 w-[3.4rem] shrink-0 rounded-md bg-elevated px-1 text-xs font-medium outline-none card-shadow"
              aria-label={t(lang, "budget.language")}
            >
              {LANGS.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.code.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <button
              type="button"
              className="flex size-10 shrink-0 items-center justify-center rounded-md bg-elevated text-fg hover:bg-card"
              aria-label={t(lang, "cal.prev")}
              onClick={() => setMonth(prevMonthKey(month))}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-elevated px-2 text-sm font-medium card-shadow"
              aria-haspopup="dialog"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <CalendarDays className="size-4 shrink-0 text-muted" />
              <span className="truncate">{monthTitle(month, lang)}</span>
            </button>
            <button
              type="button"
              className="flex size-10 shrink-0 items-center justify-center rounded-md bg-elevated text-fg hover:bg-card"
              aria-label={t(lang, "cal.next")}
              onClick={() => setMonth(nextMonthKey(month))}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-2">
          <Link to="/" aria-label={t(lang, "appName")} className="shrink-0">
            <LogoMark className="size-9" />
          </Link>
          <select
            value={activeId}
            onChange={(e) => useAppStore.getState().setActiveProfile(e.target.value)}
            className="h-11 max-w-[9rem] shrink-0 truncate rounded-md bg-elevated px-2 text-sm font-medium outline-none card-shadow"
            aria-label={t(lang, "budget.budgetProfile")}
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="flex size-11 shrink-0 items-center justify-center rounded-md bg-elevated text-fg hover:bg-card"
            aria-label={t(lang, "cal.prev")}
            onClick={() => setMonth(prevMonthKey(month))}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            className="flex h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-elevated px-2 text-sm font-medium card-shadow"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <CalendarDays className="size-4 shrink-0 text-muted" />
            <span className="truncate">{monthTitle(month, lang)}</span>
          </button>
          <button
            type="button"
            className="flex size-11 shrink-0 items-center justify-center rounded-md bg-elevated text-fg hover:bg-card"
            aria-label={t(lang, "cal.next")}
            onClick={() => setMonth(nextMonthKey(month))}
          >
            <ChevronRight className="size-5" />
          </button>
          <select
            value={currency}
            onChange={(e) => useAppStore.getState().setCurrency(e.target.value as CurrencyCode)}
            className="h-11 w-[6.5rem] shrink-0 rounded-md bg-elevated px-1 text-sm font-medium outline-none card-shadow"
            aria-label={t(lang, "budget.currency")}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} {c.symbol}
              </option>
            ))}
          </select>
          <select
            value={lang}
            onChange={(e) => useAppStore.getState().setLang(e.target.value as Lang)}
            className="h-11 w-[3.5rem] shrink-0 rounded-md bg-elevated px-1 text-sm font-medium outline-none card-shadow"
            aria-label={t(lang, "budget.language")}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.code.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      )}
      {open ? (
        <div
          role="dialog"
          aria-label={t(lang, "budget.pickPeriod")}
          className="absolute top-[calc(100%+0.5rem)] left-0 z-40 w-full min-w-[16rem] rounded-xl bg-card p-3 card-shadow"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-md hover:bg-elevated"
              aria-label={t(lang, "budget.prevYear")}
              onClick={() => setYear((y) => y - 1)}
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-semibold tabular">{year}</p>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-md hover:bg-elevated"
              aria-label={t(lang, "budget.nextYear")}
              onClick={() => setYear((y) => y + 1)}
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {names.map((label, i) => {
              const m = i + 1;
              const key = monthKeyFromParts(year, m);
              const selected = year === Number(yearOf(month)) && m === selectedMonth;
              return (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    "h-11 rounded-md text-sm font-medium",
                    selected ? "bg-primary text-primary-fg" : "bg-elevated text-fg hover:bg-card",
                  )}
                  onClick={() => {
                    setMonth(key);
                    setOpen(false);
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <span className="sr-only">{profile.name}</span>
    </div>
  );
}

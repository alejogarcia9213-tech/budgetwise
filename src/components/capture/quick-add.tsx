import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { Panel } from "@/components/finance/panel";
import { ct } from "@/lib/capture/copy";
import { guessCategory, parseQuickText } from "@/lib/capture/quick";
import { formatMoney } from "@/lib/money";
import { useAppStore, useProfile } from "@/lib/store";
import { cn } from "@/lib/utils";

const CAT_DOT: Record<string, string> = { essential: "#6E7BFF", investing: "#13C636", flexible: "#F5A623" };

/** One input, one Enter. The fastest way to keep the budget honest. */
export function QuickAdd() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const [text, setText] = useState("");

  const known = useMemo(
    () => [...(profile.months[month]?.items ?? []), ...profile.recurring].map((i) => ({ name: i.name, category: i.category })),
    [profile, month],
  );
  const parsed = parseQuickText(text, currency);
  const preview = parsed
    ? { ...parsed, category: parsed.forced ?? guessCategory(parsed.name, profile.merchantCategoryRules ?? [], known).category }
    : null;

  const recent = useMemo(() => {
    const seen = new Set<string>();
    return [...profile.transactions]
      .filter((t) => t.type === "expense")
      .reverse()
      .filter((t) => (seen.has(t.name.toLowerCase()) ? false : (seen.add(t.name.toLowerCase()), true)))
      .slice(0, 5);
  }, [profile.transactions]);

  const save = () => {
    if (!preview) {
      toast.error(ct(lang, "quickBad"));
      return;
    }
    const name = preview.name || "Gasto";
    useAppStore.getState().addItem({ name, amount: preview.amount, category: preview.category });
    toast.success(ct(lang, "quickSaved", { name, amount: formatMoney(preview.amount, currency, lang) }));
    setText("");
  };

  return (
    <Panel accent="commit">
      <div className="flex items-center gap-2">
        <Zap className="size-5 text-[#8B95FF]" />
        <h2 className="text-lg font-semibold">{ct(lang, "quickTitle")}</h2>
      </div>
      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          inputMode="text"
          enterKeyHint="done"
          autoComplete="off"
          aria-label={ct(lang, "quickTitle")}
          placeholder={ct(lang, "quickPh")}
          className="h-12 min-w-0 flex-1 rounded-xl border border-border bg-elevated px-4 text-base outline-none placeholder:text-subtle focus:border-[#8B95FF]"
        />
        <button
          type="submit"
          className="h-12 shrink-0 rounded-xl bg-[#6E7BFF] px-5 font-semibold text-white disabled:opacity-50"
          disabled={!preview}
        >
          +
        </button>
      </form>
      <p className="mt-2 min-h-5 text-sm text-muted">
        {preview ? (
          <span className="inline-flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: CAT_DOT[preview.category] }} />
            {preview.name || "Gasto"} · {formatMoney(preview.amount, currency, lang)}
          </span>
        ) : (
          ct(lang, "quickHint")
        )}
      </p>
      {recent.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {recent.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setText(`${r.name} ${String(r.amount)}`)}
              className={cn("h-9 rounded-full border border-border px-3 text-sm text-muted hover:text-fg")}
            >
              {r.name} · {formatMoney(r.amount, currency, lang)}
            </button>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}

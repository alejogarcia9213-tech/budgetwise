import { Label } from "@/components/ui/label";
import { t } from "@/lib/i18n";
import { useAppStore, useProfile } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MethodSelect({
  value,
  onChange,
  id,
}: {
  value?: string;
  onChange: (id: string) => void;
  id?: string;
}) {
  const lang = useAppStore((s) => s.lang);
  const methods = useProfile().paymentMethods.filter((m) => !m.archived);
  if (methods.length === 0) return null;
  return (
    <div>
      <Label htmlFor={id}>{t(lang, "budget.method")}</Label>
      <div id={id} role="listbox" aria-label={t(lang, "budget.method")} className="mt-1 flex flex-wrap gap-2">
        <button
          type="button"
          role="option"
          aria-selected={!value}
          onClick={() => onChange("")}
          className={cn(
            "min-h-11 rounded-md px-3 text-sm font-medium card-shadow",
            !value ? "bg-primary text-primary-fg" : "bg-elevated text-fg",
          )}
        >
          {t(lang, "budget.methodNone")}
        </button>
        {methods.map((m) => (
          <button
            type="button"
            role="option"
            aria-selected={value === m.id}
            key={m.id}
            onClick={() => onChange(m.id)}
            className={cn(
              "min-h-11 rounded-md px-3 text-sm font-medium card-shadow",
              value === m.id ? "bg-primary text-primary-fg" : "bg-elevated text-fg",
            )}
          >
            <span className="mr-2 inline-block size-2 rounded-full" style={{ background: m.color }} />
            {m.name}
          </button>
        ))}
      </div>
    </div>
  );
}

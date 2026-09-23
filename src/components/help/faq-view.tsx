import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

const KEYS = ["add", "method", "month", "scan", "merge", "sync", "advanced", "privacy"] as const;

export function FaqView() {
  const lang = useAppStore((s) => s.lang);
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "faq.title")}</h1>
      <p className="text-sm text-muted">{t(lang, "faq.subtitle")}</p>
      <ul className="space-y-3">
        {KEYS.map((k) => (
          <li key={k} className="rounded-xl bg-card p-4 card-shadow">
            <p className="font-medium">{t(lang, `faq.${k}Q`)}</p>
            <p className="mt-1.5 text-sm text-muted">{t(lang, `faq.${k}A`)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { t, LANGS } from "@/lib/i18n";
import { CURRENCIES } from "@/lib/money";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const STEPS: { title: string; body: string; target: string | null }[] = [
  { title: "tour.welcome", body: "tour.welcomeBody", target: null },
  { title: "tour.home", body: "tour.homeBody", target: "tour-income" },
  { title: "tour.scan", body: "tour.scanBody", target: "tour-scan" },
  { title: "tour.envelopes", body: "tour.envelopesBody", target: "tour-envelopes" },
  { title: "tour.nav", body: "tour.navBody", target: "tour-nav" },
  { title: "tour.settings", body: "tour.settingsBody", target: "tour-settings" },
];

function pickTarget(id: string | null): HTMLElement | null {
  if (!id) return null;
  const ids = id === "tour-nav" ? ["tour-nav", "tour-nav-mobile"] : [id];
  for (const key of ids) {
    const nodes = [...document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`)];
    const visible = nodes.find((el) => {
      const r = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return r.width > 8 && r.height > 8 && style.display !== "none" && style.visibility !== "hidden";
    });
    if (visible) return visible;
  }
  return null;
}

export function AppTour() {
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const hydrated = useAppStore((s) => s.hydrated);
  const done = useAppStore((s) => s.tourComplete);
  const [step, setStep] = useState(0);
  const [hole, setHole] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (!hydrated || done) return;
    useAppStore.getState().applyVisitorLocale();
  }, [hydrated, done]);

  useLayoutEffect(() => {
    if (done || !hydrated) return;
    const targetId = STEPS[step]?.target ?? null;
    const el = pickTarget(targetId);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      const place = () => {
        const r = el.getBoundingClientRect();
        setHole({
          top: Math.max(8, r.top - 8),
          left: Math.max(8, r.left - 8),
          width: r.width + 16,
          height: r.height + 16,
        });
      };
      place();
      const tmr = window.setTimeout(place, 280);
      window.addEventListener("resize", place);
      window.addEventListener("scroll", place, true);
      return () => {
        window.clearTimeout(tmr);
        window.removeEventListener("resize", place);
        window.removeEventListener("scroll", place, true);
      };
    }
    setHole(null);
  }, [step, done, hydrated]);

  if (!hydrated || done) return null;

  const last = step === STEPS.length - 1;
  const cur = CURRENCIES.find((c) => c.code === currency)?.label ?? currency;
  const current = STEPS[step]!;

  function finish() {
    useAppStore.getState().setTourComplete(true);
    useAppStore.getState().setSetupComplete(true);
  }

  const tipTop = hole ? Math.min(window.innerHeight - 220, hole.top + hole.height + 12) : undefined;
  const tipStyle = hole
    ? { top: tipTop, left: Math.min(Math.max(12, hole.left), window.innerWidth - 24 - 340) }
    : undefined;

  return (
    <div className="fixed inset-0 z-[70]">
      {hole ? null : <div className="absolute inset-0 bg-bg/70" />}
      {hole ? (
        <div
          className="pointer-events-none absolute rounded-xl ring-2 ring-primary"
          style={{
            top: hole.top,
            left: hole.left,
            width: hole.width,
            height: hole.height,
            boxShadow: "0 0 0 9999px rgb(11 11 15 / 0.72)",
          }}
        />
      ) : null}
      <div
        className={cn(
          "absolute z-[71] w-[min(22rem,calc(100%-1.5rem))] rounded-2xl bg-card p-5 card-shadow",
          hole ? "" : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={hole ? tipStyle : undefined}
      >
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          {t(lang, "tour.badge", { n: String(step + 1), total: String(STEPS.length) })}
        </p>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">{t(lang, current.title)}</h1>
        <p className="mt-2 text-sm text-muted">{t(lang, current.body)}</p>
        {step === 0 ? (
          <p className="mt-3 rounded-lg bg-elevated px-3 py-2 text-sm">
            {t(lang, "tour.detected", {
              language: LANGS.find((l) => l.code === lang)?.label ?? lang,
              currency: cur,
            })}
          </p>
        ) : null}
        <div className="mt-5 flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={finish}>
            {t(lang, "tour.skip")}
          </Button>
          {step > 0 ? (
            <Button variant="secondary" className="flex-1" onClick={() => setStep((s) => s - 1)}>
              {t(lang, "tour.back")}
            </Button>
          ) : null}
          <Button className="flex-1" onClick={() => (last ? finish() : setStep((s) => s + 1))}>
            {last ? t(lang, "tour.done") : t(lang, "tour.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}

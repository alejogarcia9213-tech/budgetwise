import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  LayoutDashboard,
  LineChart,
  Menu,
  Settings,
  X,
  ArrowLeftRight,
  Calculator,
  CircleHelp,
  MessageSquareText,
  Sparkles,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { Logo } from "@/components/logo";
import { SetupGate } from "@/components/setup/setup-gate";
import { AppTour } from "@/components/setup/app-tour";
import { MonthPicker } from "@/components/finance/month-picker";
import { t } from "@/lib/i18n";
import { useAppStore, useProfile } from "@/lib/store";
import { cn } from "@/lib/utils";

const MAIN_NAV = [
  { to: "/", key: "nav.dashboard", icon: LayoutDashboard },
  { to: "/transactions", key: "nav.transactions", icon: ArrowLeftRight },
  { to: "/calendar", key: "nav.calendar", icon: CalendarDays },
] as const;

const MORE_NAV = [
  { to: "/calculator", key: "nav.calculator", icon: Calculator },
  { to: "/reports", key: "nav.reports", icon: LineChart },
  { to: "/settings", key: "nav.settings", icon: Settings },
  { to: "/faq", key: "nav.faq", icon: CircleHelp },
  { to: "/feedback", key: "nav.feedback", icon: MessageSquareText },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const lang = useAppStore((s) => s.lang);
  const theme = useAppStore((s) => s.theme);
  const hydrated = useAppStore((s) => s.hydrated);
  const setHydrated = useAppStore((s) => s.setHydrated);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const [more, setMore] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  useEffect(() => {
    void Promise.resolve(useAppStore.persist.rehydrate()).finally(() => setHydrated(true));
  }, [setHydrated]);

  useEffect(() => {
    if (!hydrated) return;
    useAppStore.getState().applyAutosForMonth(month);
  }, [hydrated, month, profile.id]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme === "dark");
  }, [lang, theme]);

  useEffect(() => {
    document.body.style.overflow = more ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [more]);

  const moreActive = MORE_NAV.some((item) => pathname.startsWith(item.to));

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-surface px-3 py-4 md:flex">
        <div className="px-2 pb-6">
          <Link to="/" aria-label={t(lang, "appName")}>
            <Logo />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1" data-tour="tour-nav">
          {[...MAIN_NAV, ...MORE_NAV].map((item) => (
            <SideLink
              key={item.to}
              to={item.to}
              label={t(lang, item.key)}
              icon={<item.icon className="size-4" />}
              active={item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)}
              dataTour={item.to === "/settings" ? "tour-settings" : undefined}
            />
          ))}
        </nav>
        <button
          type="button"
          onClick={() => {
            void navigate({ to: "/" });
            useAppStore.getState().setTourComplete(false);
          }}
          className="mt-2 flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted hover:bg-elevated hover:text-fg"
        >
          <Sparkles className="size-4" />
          {t(lang, "tour.replay")}
        </button>
        <div className="mt-auto space-y-2 px-3 pt-4">
          <p className="text-xs text-subtle">{profile.name}</p>
          <Byline />
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-border bg-bg/90 backdrop-blur-md md:hidden">
        <div className="px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <MonthPicker compact />
        </div>
      </header>

      <div className="md:pl-60">
        <div className="relative mx-auto hidden w-full max-w-5xl px-8 pt-6 md:block">
          <MonthPicker />
        </div>

        {more ? (
          <div className="fixed inset-0 z-50 md:hidden">
            <button
              className="absolute inset-0 bg-bg/70"
              aria-label={t(lang, "common.close")}
              onClick={() => setMore(false)}
            />
            <nav className="absolute right-0 bottom-0 left-0 flex max-h-[min(36rem,86dvh)] flex-col gap-1 overflow-y-auto rounded-t-2xl bg-surface px-4 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] card-shadow sheet-in">
              <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border" aria-hidden />
              <div className="mb-2 flex items-center justify-between">
                <p className="text-base font-semibold">{t(lang, "nav.more")}</p>
                <button
                  className="flex size-11 items-center justify-center rounded-md text-muted hover:bg-elevated"
                  onClick={() => setMore(false)}
                  aria-label={t(lang, "common.close")}
                >
                  <X className="size-5" />
                </button>
              </div>
              {MORE_NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMore(false)}
                  className={cn(
                    "flex min-h-14 items-center gap-3 rounded-md px-3 text-base font-medium",
                    pathname.startsWith(item.to) ? "bg-primary text-primary-fg" : "text-fg hover:bg-elevated",
                  )}
                >
                  <item.icon className="size-5" />
                  {t(lang, item.key)}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMore(false);
                  void navigate({ to: "/" });
                  useAppStore.getState().setTourComplete(false);
                }}
                className="flex min-h-14 items-center gap-3 rounded-md px-3 text-left text-base font-medium text-fg hover:bg-elevated"
              >
                <Sparkles className="size-5" />
                {t(lang, "tour.replay")}
              </button>
              <Byline className="py-4 text-center" />
            </nav>
          </div>
        ) : null}

        <div className="mx-auto w-full max-w-5xl px-3 pt-3 pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:px-8 md:pt-4 md:pb-12">
          {children}
          <Byline className="py-8 text-center" />
        </div>
      </div>

      <nav
        data-tour="tour-nav-mobile"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
      >
        <ul className="grid grid-cols-4">
          {MAIN_NAV.map((item) => (
            <li key={item.to}>
              <TabLink
                to={item.to}
                label={t(lang, item.key)}
                icon={<item.icon className="size-5" />}
                active={item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)}
              />
            </li>
          ))}
          <li>
            <button
              type="button"
              data-tour="tour-settings"
              onClick={() => setMore(true)}
              className={cn(
                "flex h-14 w-full flex-col items-center justify-center gap-0.5 px-1 text-[0.7rem] leading-tight font-medium",
                more || moreActive ? "text-primary" : "text-muted",
              )}
            >
              <Menu className="size-5" />
              <span className="max-w-full truncate">{t(lang, "nav.more")}</span>
            </button>
          </li>
        </ul>
      </nav>

      <Toaster theme={theme} position="top-center" />
      <SetupGate />
      {pathname.startsWith("/capture") ? null : <AppTour />}
    </div>
  );
}

function SideLink({
  to,
  label,
  icon,
  active,
  dataTour,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  dataTour?: string;
}) {
  return (
    <Link
      to={to}
      data-tour={dataTour}
      className={cn(
        "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium",
        active ? "bg-primary text-primary-fg" : "text-muted hover:bg-elevated hover:text-fg",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function TabLink({
  to,
  label,
  icon,
  active,
}: {
  to: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex h-14 flex-col items-center justify-center gap-0.5 px-1 text-[0.7rem] leading-tight font-medium",
        active ? "text-primary" : "text-muted",
      )}
    >
      {icon}
      <span className="max-w-full truncate">{label}</span>
    </Link>
  );
}

function Byline({ className }: { className?: string }) {
  const lang = useAppStore((s) => s.lang);
  return (
    <p className={cn("text-xs text-subtle", className)}>
      <a
        href="https://x.com/AlejandroGeToro"
        target="_blank"
        rel="noopener noreferrer"
        className="underline-offset-2 hover:text-fg hover:underline"
      >
        {t(lang, "byline")}
      </a>
    </p>
  );
}
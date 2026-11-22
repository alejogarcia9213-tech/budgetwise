import { useEffect, useState } from "react";
import { BellRing, Copy, Nfc, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/finance/panel";
import { ct, steps } from "@/lib/capture/copy";
import { captureUrl, dailyReminderIcs } from "@/lib/capture/quick";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Os = "ios" | "android";

function detectOs(): Os {
  if (typeof navigator === "undefined") return "android";
  return /iphone|ipad|ipod|macintosh/i.test(navigator.userAgent) ? "ios" : "android";
}

export function AutoCaptureSettings() {
  const lang = useAppStore((s) => s.lang);
  const [os, setOs] = useState<Os>("android");
  const [origin, setOrigin] = useState("https://budgetwise.grok.me");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setOs(detectOs());
    setOrigin(window.location.origin);
  }, []);

  const iosLink = captureUrl(origin);
  const androidLink = `${origin}/capture?src=android&merchant=[notification_title]&text=[notification_text]`;
  const link = os === "ios" ? iosLink : androidLink;

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      window.prompt("", value);
    }
  };

  const downloadReminder = () => {
    const ics = dailyReminderIcs({
      hour: 21,
      minute: 0,
      title: ct(lang, "reminderEvent"),
      body: ct(lang, "reminderDesc"),
      url: `${origin}/capture`,
    });
    const blob = new Blob([ics], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "budget-wise-daily.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <Panel accent="commit" id="auto-capture">
      <div className="flex items-center gap-2">
        <Nfc className="size-5 text-[#8B95FF]" />
        <h2 className="text-lg font-semibold">{ct(lang, "autoTitle")}</h2>
      </div>
      <p className="mt-2 text-sm text-muted">{ct(lang, "autoIntro")}</p>

      <div role="tablist" className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-elevated p-1">
        {(["ios", "android"] as const).map((k) => (
          <button
            key={k}
            role="tab"
            type="button"
            aria-selected={os === k}
            onClick={() => setOs(k)}
            className={cn(
              "flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-medium",
              os === k ? "bg-surface text-fg shadow-sm" : "text-muted",
            )}
          >
            <Smartphone className="size-4" />
            {ct(lang, k === "ios" ? "iphone" : "android")}
          </button>
        ))}
      </div>

      <ol className="mt-4 space-y-3">
        {steps(lang, os === "ios" ? "iosSteps" : "androidSteps").map((step, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#6E7BFF] text-xs font-bold text-white">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      {os === "android" ? <p className="mt-4 text-xs text-muted">{ct(lang, "androidUrl")}</p> : null}
      <div className="mt-2 flex flex-col items-stretch gap-2 rounded-xl border border-border bg-elevated p-2">
        <code className="min-w-0 flex-1 break-all px-1 text-xs leading-relaxed">{link}</code>
        <Button size="sm" variant="secondary" onClick={() => void copy(link)}>
          <Copy className="size-4" />
          {copied === link ? ct(lang, "copied") : ct(lang, "copy")}
        </Button>
      </div>
      {os === "ios" ? <p className="mt-3 text-xs text-muted">{ct(lang, "iosNote")}</p> : null}

      <Button asChild variant="secondary" className="mt-3 w-full">
        <a href={`${origin}/capture?amount=12.50&merchant=Cafe%20Demo&card=4242&src=${os}`}>{ct(lang, "test")}</a>
      </Button>

      <div className="mt-5 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <BellRing className="size-4 text-[#F5A623]" />
          <h3 className="font-semibold">{ct(lang, "reminderTitle")}</h3>
        </div>
        <p className="mt-1 text-sm text-muted">{ct(lang, "reminderBody")}</p>
        <Button variant="secondary" className="mt-3 w-full" onClick={downloadReminder}>
          {ct(lang, "reminderBtn")}
        </Button>
      </div>
    </Panel>
  );
}

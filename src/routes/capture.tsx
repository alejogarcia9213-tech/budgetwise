import { useEffect, useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Nfc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/finance/panel";
import { QuickAdd } from "@/components/capture/quick-add";
import { SuggestionInbox } from "@/components/capture/suggestion-inbox";
import { ct } from "@/lib/capture/copy";
import { parseLooseAmount, parseSharedText } from "@/lib/capture/quick";
import type { CaptureSource } from "@/lib/capture/types";
import { currentMonthKey } from "@/lib/dates";
import { formatMoney } from "@/lib/money";
import { useAppStore, useProfile } from "@/lib/store";

type CaptureSearch = {
  amount?: string;
  merchant?: string;
  card?: string;
  src?: string;
  text?: string;
  title?: string;
  auto?: string;
};

const str = (v: unknown) => (v == null || v === "" ? undefined : String(v).slice(0, 500));

export const Route = createFileRoute("/capture")({
  validateSearch: (s: Record<string, unknown>): CaptureSearch => ({
    amount: str(s.amount),
    merchant: str(s.merchant),
    card: str(s.card),
    src: str(s.src),
    text: str(s.text),
    title: str(s.title),
    auto: str(s.auto),
  }),
  component: CapturePage,
});

const SOURCES: Record<string, CaptureSource> = { ios: "ios_shortcut", android: "android_automation", share: "share" };

function CapturePage() {
  const search = Route.useSearch();
  const lang = useAppStore((s) => s.lang);
  const currency = useAppStore((s) => s.currency);
  const hydrated = useAppStore((s) => s.hydrated);
  const profile = useProfile();
  const ran = useRef(false);
  const [capturedId, setCapturedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "captured" | "done" | "empty">("idle");

  useEffect(() => {
    if (!hydrated || ran.current) return;
    ran.current = true;
    const hasPayload = search.amount || search.text || search.title;
    if (!hasPayload) return;
    const st = useAppStore.getState();
    if (st.activeMonth !== currentMonthKey()) st.setMonth(currentMonthKey());
    let amount = parseLooseAmount(search.amount, currency);
    let merchant = search.merchant ?? "";
    if (amount == null && (search.text || search.title)) {
      const shared = parseSharedText(`${search.title ?? ""}\n${search.text ?? ""}`, currency);
      amount = shared.amount;
      merchant = merchant || shared.merchant;
    }
    if (amount == null) {
      setStatus("empty");
      return;
    }
    const card = search.card?.match(/\d{4}/)?.[0] ?? search.text?.match(/(?:\*|•+|x{2,}|terminada en|ending)\s?(\d{4})\b/i)?.[1] ?? null;
    const id = st.ingestCapture({
      merchant,
      amount,
      card,
      source: SOURCES[search.src ?? ""] ?? (search.text ? "share" : "link"),
    });
    if (!id) {
      setStatus("empty");
      return;
    }
    if (search.auto === "1") {
      useAppStore.getState().confirmSuggestion(id);
      setStatus("done");
    } else {
      setCapturedId(id);
      setStatus("captured");
    }
    // Keep the address bar clean so a reload doesn't re-capture.
    window.history.replaceState(null, "", "/capture");
  }, [hydrated, search, currency]);

  const sug = (profile.captureSuggestions ?? []).find((s) => s.id === capturedId);
  const doneNow = status === "done" || (status === "captured" && sug?.status === "accepted");
  const discarded = status === "captured" && sug?.status === "dismissed";

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      {status === "captured" && sug && sug.status === "pending" ? (
        <Panel accent="commit">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Nfc className="size-4" /> {ct(lang, "captured")}
          </div>
          <p className="mt-3 break-words text-4xl font-bold tracking-tight tabular-nums">
            {formatMoney((sug.amountMinor ?? 0) / 100, sug.currencyCode || currency, lang)}
          </p>
          <p className="mt-1 text-lg">{sug.merchantNormalized}</p>
          <p className="mt-1 text-sm text-muted">
            {sug.sourceAppLabel}
            {sug.cardLastFour ? ` · •••• ${sug.cardLastFour}` : ""}
          </p>
          <p className="mt-3 text-sm text-muted">{ct(lang, "capturedHint")}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button className="h-12 text-base" onClick={() => useAppStore.getState().confirmSuggestion(sug.id)}>
              {ct(lang, "confirm")}
            </Button>
            <Button variant="ghost" className="h-12" onClick={() => useAppStore.getState().dismissSuggestion(sug.id)}>
              {ct(lang, "discard")}
            </Button>
          </div>
        </Panel>
      ) : null}

      {doneNow ? (
        <Panel accent="invest">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-6 text-[#13C636]" />
            <p className="font-semibold">{ct(lang, "done")}</p>
          </div>
          <Button asChild className="mt-4 w-full">
            <Link to="/">{ct(lang, "home")}</Link>
          </Button>
        </Panel>
      ) : null}

      {discarded ? (
        <Panel>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/">{ct(lang, "home")}</Link>
          </Button>
        </Panel>
      ) : null}

      {status === "empty" ? (
        <Panel>
          <p className="text-sm text-muted">{ct(lang, "nothing")}</p>
        </Panel>
      ) : null}

      <SuggestionInbox excludeId={capturedId} />
      <QuickAdd />
    </div>
  );
}

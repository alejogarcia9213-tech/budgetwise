import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { kvGet, kvSet } from "@/lib/idb-storage";
import { t } from "@/lib/i18n";
import { uid } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const KEY = "budgetwise-feedback";

type Note = { id: string; at: string; message: string };

export function FeedbackView() {
  const lang = useAppStore((s) => s.lang);
  const [text, setText] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    void kvGet(KEY).then((raw) => {
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as Note[];
        if (Array.isArray(parsed)) setNotes(parsed);
      } catch {
        /* ignore */
      }
    });
  }, []);

  async function save() {
    const message = text.trim();
    if (message.length < 4) return;
    const next = [{ id: uid(), at: new Date().toISOString(), message }, ...notes].slice(0, 40);
    setNotes(next);
    setText("");
    await kvSet(KEY, JSON.stringify(next));
    toast.success(t(lang, "feedback.saved"));
  }

  function share() {
    const body = text.trim() || notes[0]?.message || "";
    if (!body) return;
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(`@AlejandroGeToro Budget Wise: ${body.slice(0, 200)}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">{t(lang, "feedback.title")}</h1>
      <p className="text-sm text-muted">{t(lang, "feedback.subtitle")}</p>
      <div>
        <Label htmlFor="fb">{t(lang, "feedback.label")}</Label>
        <textarea
          id="fb"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-md bg-elevated px-3 py-2 text-sm outline-none card-shadow focus-visible:ring-2 focus-visible:ring-ring/70"
          placeholder={t(lang, "feedback.ph")}
        />
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1" onClick={() => void save()} disabled={text.trim().length < 4}>
          {t(lang, "feedback.save")}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={share} disabled={text.trim().length < 4 && notes.length === 0}>
          {t(lang, "feedback.share")}
        </Button>
      </div>
      {notes.length > 0 ? (
        <ul className="mt-2 space-y-2">
          {notes.map((n) => (
            <li key={n.id} className="rounded-xl bg-card p-3 text-sm card-shadow">
              <p className="text-xs text-muted">{new Date(n.at).toLocaleString()}</p>
              <p className="mt-1">{n.message}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

import { Camera, ImagePlus, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { AmountExprInput } from "@/components/finance/amount-expr";
import { MethodSelect } from "@/components/finance/method-select";
import { ocrImage } from "@/lib/ocr";
import { parseReceiptText } from "@/lib/receipt";
import { t } from "@/lib/i18n";
import type { CategoryId } from "@/lib/types";
import { useAppStore, useProfile } from "@/lib/store";

export function ReceiptScanButton({ className }: { className?: string }) {
  const lang = useAppStore((s) => s.lang);
  const month = useAppStore((s) => s.activeMonth);
  const profile = useProfile();
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState<CategoryId>("essential");
  const [methodId, setMethodId] = useState("");
  const [matched, setMatched] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setProgress(0);
    setStage("");
    try {
      const text = await ocrImage(file, (pct, st) => {
        setProgress(pct);
        if (st) setStage(st);
      });
      const guess = parseReceiptText(text, {
        items: [
          ...(profile.months[month]?.items ?? []),
          ...profile.recurring,
        ].map((it) => ({ name: it.name, category: it.category })),
        methods: profile.paymentMethods.filter((m) => !m.archived),
      });
      setName(guess.merchant);
      setAmount(guess.amount ?? 0);
      setCategory(guess.category);
      setMethodId(guess.methodId);
      setMatched(guess.matchedExisting);
      setOpen(true);
      if (!text) toast.error(t(lang, "receipt.readFail"));
    } catch {
      toast.error(t(lang, "receipt.readFail"));
    } finally {
      setBusy(false);
    }
  }

  function save() {
    if (!name.trim() || amount <= 0) return;
    useAppStore.getState().addItem({
      name: name.trim(),
      amount,
      category,
      methodId: methodId || undefined,
    });
    toast.success(t(lang, "receipt.saved"));
    setOpen(false);
  }

  return (
    <>
      <div className={className ?? "grid grid-cols-2 gap-2"}>
        <Button
          type="button"
          variant="secondary"
          className="h-11"
          disabled={busy}
          onClick={() => cameraRef.current?.click()}
        >
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Camera className="size-4" />}
          {busy ? t(lang, stage === "cache" ? "receipt.cached" : "receipt.progress", { pct: String(progress) }) : t(lang, "receipt.photo")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-11"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          {busy ? t(lang, "receipt.scanning") : t(lang, "receipt.upload")}
        </Button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          void onFile(f);
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          void onFile(f);
        }}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title={t(lang, "receipt.confirm")}>
          <p className="text-sm text-muted">{matched ? t(lang, "receipt.matched") : t(lang, "receipt.review")}</p>
          <div className="mt-3 space-y-3">
            <div>
              <Label>{t(lang, "budget.name")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>{t(lang, "budget.total")}</Label>
              <AmountExprInput value={amount} onValue={setAmount} />
            </div>
            <div>
              <Label>{t(lang, "common.category")}</Label>
              <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
                <option value="essential">{t(lang, "budget.essential")}</option>
                <option value="investing">{t(lang, "budget.investing")}</option>
                <option value="flexible">{t(lang, "budget.flexible")}</option>
              </NativeSelect>
            </div>
            <div>
              <MethodSelect value={methodId} onChange={setMethodId} />
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={save} disabled={!name.trim() || amount <= 0}>
                {t(lang, "common.save")}
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                {t(lang, "common.cancel")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { AmountExprInput } from "@/components/finance/amount-expr";
import { MethodSelect } from "@/components/finance/method-select";
import { dateInMonth, isoToday } from "@/lib/dates";
import { t } from "@/lib/i18n";
import { useAppStore, type Transaction, type TxCategory, type TxType } from "@/lib/store";

const TYPES: TxType[] = ["income", "expense", "saving", "investment", "debt-payment"];

function typeToCategory(type: TxType, fallback: TxCategory): TxCategory {
  if (type === "income") return "income";
  if (type === "investment") return "investing";
  if (type === "saving") return "savings";
  if (type === "debt-payment") return "debt";
  if (fallback === "essential" || fallback === "flexible") return fallback;
  return "essential";
}

export function TxDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Transaction;
}) {
  const lang = useAppStore((s) => s.lang);
  const month = useAppStore((s) => s.activeMonth);
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial?.amount ?? 0);
  const [type, setType] = useState<TxType>(initial?.type ?? "expense");
  const [category, setCategory] = useState<TxCategory>(initial?.category ?? "essential");
  const [date, setDate] = useState(
    initial?.date ?? (isoToday().startsWith(month) ? isoToday() : dateInMonth(month, 1)),
  );
  const [methodId, setMethodId] = useState(initial?.methodId ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");

  function submit() {
    if (!name.trim() || amount <= 0) return;
    const cat = typeToCategory(type, category);
    const payload = {
      name: name.trim(),
      amount,
      type,
      category: cat,
      date,
      methodId: methodId || undefined,
      notes: notes.trim() || undefined,
    };
    if (initial) useAppStore.getState().updateTransaction(initial.id, payload);
    else useAppStore.getState().addTransaction(payload);
    onOpenChange(false);
    setName("");
    setAmount(0);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={t(lang, initial ? "tx.edit" : "tx.add")}>
        <div className="space-y-3">
          <div>
            <Label>{t(lang, "common.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t(lang, "common.amount")}</Label>
            <AmountExprInput value={amount} onValue={setAmount} />
            <p className="mt-1 text-xs text-subtle">{t(lang, "budget.amountExprHint")}</p>
          </div>
          <div>
            <Label>{t(lang, "common.type")}</Label>
            <NativeSelect
              value={type}
              onChange={(e) => {
                const next = e.target.value as TxType;
                setType(next);
                setCategory(typeToCategory(next, category));
              }}
            >
              {TYPES.map((ty) => (
                <option key={ty} value={ty}>
                  {t(lang, `tx.${ty === "debt-payment" ? "debt" : ty}`)}
                </option>
              ))}
            </NativeSelect>
          </div>
          {type === "expense" ? (
            <div>
              <Label>{t(lang, "common.category")}</Label>
              <NativeSelect value={category} onChange={(e) => setCategory(e.target.value as TxCategory)}>
                <option value="essential">{t(lang, "budget.essential")}</option>
                <option value="flexible">{t(lang, "budget.flexible")}</option>
              </NativeSelect>
            </div>
          ) : null}
          <div>
            <Label>{t(lang, "common.date")}</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <MethodSelect value={methodId} onChange={setMethodId} />
          <div>
            <Label>{t(lang, "common.notes")}</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <Button className="w-full" onClick={submit}>
            {t(lang, "common.save")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Home, Landmark, ShoppingBag } from "lucide-react";
import { HealthCard, TipCard, YearlyCard } from "@/components/finance/analysis-cards";
import { CategoryCard, DebtAllocCard, GoalsCard, IncomeCard, MonthlySummary } from "@/components/finance/budget-cards";
import { DebtCard, InvestmentCalcCard, LargePurchasesCard, RecurringCard } from "@/components/finance/planning-cards";
import { CalculatorView } from "@/components/calculator/calculator-view";
import { Panel } from "@/components/finance/panel";
import { ReceiptScanButton } from "@/components/finance/receipt-scan";
import { SuggestionInbox } from "@/components/capture/suggestion-inbox";
import { QuickAdd } from "@/components/capture/quick-add";
import { t } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export function PlannerView() {
  const lang = useAppStore((s) => s.lang);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div data-tour="tour-income">
        <IncomeCard />
      </div>
      <SuggestionInbox />
      <QuickAdd />
      <div data-tour="tour-scan">
        <ReceiptScanButton />
      </div>
      <RecurringCard />
      <LargePurchasesCard />
      <div data-tour="tour-envelopes" className="flex flex-col gap-4">
        <CategoryCard
          id="essential"
          icon={<Home className="size-5" />}
          title={t(lang, "budget.essential")}
          hint={t(lang, "budget.essentialHint")}
        />
        <CategoryCard
          id="investing"
          icon={<Landmark className="size-5" />}
          title={t(lang, "budget.investing")}
          hint={t(lang, "budget.investingHint")}
        />
        <CategoryCard
          id="flexible"
          icon={<ShoppingBag className="size-5" />}
          title={t(lang, "budget.flexible")}
          hint={t(lang, "budget.flexibleHint")}
        />
      </div>
      <GoalsCard />
      <DebtCard />
      <DebtAllocCard />
      <MonthlySummary />
      <InvestmentCalcCard />
      <Panel fold="fullcalc" foldTitle={t(lang, "budget.fullCalc")} accent="tools">
        <h2 className="fold-title text-lg font-semibold">{t(lang, "budget.fullCalc")}</h2>
        <p className="mt-1 mb-4 text-sm text-muted">{t(lang, "budget.fullCalcHint")}</p>
        <CalculatorView embedded />
      </Panel>
      <HealthCard />
      <YearlyCard />
      <TipCard />
    </div>
  );
}
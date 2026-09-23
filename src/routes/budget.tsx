import { createFileRoute } from "@tanstack/react-router";
import { BudgetView } from "@/components/budget/budget-view";

export const Route = createFileRoute("/budget")({ component: BudgetPage });

function BudgetPage() {
  return <BudgetView />;
}

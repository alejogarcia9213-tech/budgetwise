import { createFileRoute } from "@tanstack/react-router";
import { CalculatorView } from "@/components/calculator/calculator-view";

export const Route = createFileRoute("/calculator")({ component: CalculatorPage });

function CalculatorPage() {
  return <CalculatorView />;
}

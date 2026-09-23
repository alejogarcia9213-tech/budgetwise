import { createFileRoute } from "@tanstack/react-router";
import { PlanningView } from "@/components/planning/planning-view";

export const Route = createFileRoute("/planning")({ component: PlanningPage });

function PlanningPage() {
  return <PlanningView />;
}

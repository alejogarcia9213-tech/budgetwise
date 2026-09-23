import { createFileRoute } from "@tanstack/react-router";
import { TransactionsView } from "@/components/transactions/transactions-view";

export const Route = createFileRoute("/transactions")({ component: TransactionsPage });

function TransactionsPage() {
  return <TransactionsView />;
}

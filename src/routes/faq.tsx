import { createFileRoute } from "@tanstack/react-router";
import { FaqView } from "@/components/help/faq-view";

export const Route = createFileRoute("/faq")({ component: FaqView });

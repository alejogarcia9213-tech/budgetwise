import { createFileRoute } from "@tanstack/react-router";
import { FeedbackView } from "@/components/help/feedback-view";

export const Route = createFileRoute("/feedback")({ component: FeedbackView });

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  title,
}: {
  className?: string;
  children: ReactNode;
  title: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-bg/70 data-[state=open]:animate-[fadeIn_150ms_ease-out]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-card text-fg card-shadow focus:outline-none",
          "inset-x-0 bottom-0 top-auto flex max-h-[min(92dvh,44rem)] w-full flex-col",
          "rounded-t-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] max-md:sheet-in",
          "md:inset-auto md:top-1/2 md:left-1/2 md:w-[min(100%-1.5rem,28rem)] md:max-h-[min(90vh,40rem)]",
          "md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-xl md:pb-5",
          className,
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border md:hidden" aria-hidden />
        <div className="mb-4 flex items-start justify-between gap-3">
          <DialogPrimitive.Title className="text-base font-semibold">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted hover:bg-elevated hover:text-fg"
            aria-label="Close"
          >
            <X className="size-5" />
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 overflow-y-auto overscroll-contain">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md bg-elevated px-3 text-base text-fg tabular outline-none md:text-sm",
        "placeholder:text-subtle card-shadow",
        "focus-visible:ring-2 focus-visible:ring-ring/70",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
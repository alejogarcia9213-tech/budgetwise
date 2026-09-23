import { cn } from "@/lib/utils";

/** In-app mark uses the published photographic icon so sidebar = home screen. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <img
      src="/icon-192.png"
      alt=""
      width={36}
      height={36}
      draggable={false}
      aria-hidden="true"
      className={cn("rounded-[22%] object-cover", className)}
    />
  );
}

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark className={compact ? "size-8" : "size-9"} />
      <div className="leading-none">
        <p className={cn("font-semibold tracking-tight text-fg", compact ? "text-base" : "text-lg")}>
          Budget Wise
        </p>
        {compact ? null : (
          <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-muted">Local finance</p>
        )}
      </div>
    </div>
  );
}

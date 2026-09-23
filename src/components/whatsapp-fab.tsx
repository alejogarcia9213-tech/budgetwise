import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 1.82c4.46 0 8.09 3.63 8.09 8.09 0 4.46-3.63 8.09-8.09 8.09-1.42 0-2.8-.37-4.01-1.06l-.29-.17-3.12.82.83-3.04-.18-.31a8.07 8.07 0 0 1-1.23-4.33c0-4.46 3.63-8.09 8.09-8.09zm-2.7 4.4c-.17 0-.44.06-.67.31-.23.26-.88.86-.88 2.1 0 1.24.9 2.44 1.02 2.61.13.17 1.76 2.82 4.35 3.85 2.15.85 2.59.68 3.06.64.47-.04 1.51-.62 1.72-1.21.21-.6.21-1.11.15-1.21-.07-.1-.23-.17-.48-.3-.25-.13-1.51-.75-1.74-.83-.23-.08-.4-.13-.57.13-.17.26-.65.83-.8 1-.14.17-.29.2-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.38-1.73-.15-.26-.02-.4.11-.53.11-.11.25-.29.38-.44.12-.14.17-.25.25-.42.09-.17.04-.32-.02-.44-.06-.13-.57-1.37-.78-1.87-.2-.48-.41-.42-.57-.42z"
      />
    </svg>
  );
}

export function WhatsAppFab({ text, className }: { text: string; className?: string }) {
  const href = `https://wa.me/?text=${encodeURIComponent(text)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="WhatsApp"
      className={cn(
        "fixed right-4 z-40 flex size-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-lg",
        "bottom-[max(1rem,env(safe-area-inset-bottom))]",
        "transition-transform duration-150 hover:scale-105 active:scale-95",
        className,
      )}
    >
      <WhatsAppIcon className="size-8" />
    </a>
  );
}

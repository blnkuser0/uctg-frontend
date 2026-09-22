import { cn } from "@/lib/utils";

// The ring color must match whatever surface the dot sits on (card, sidebar, popover, …) so it
// reads as a cutout rather than a mismatched square edge — callers pass the right one in.
export function OnlineDot({ ringClassName = "ring-card", className }: { ringClassName?: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-emerald-500 ring-2", ringClassName, className)}
    />
  );
}

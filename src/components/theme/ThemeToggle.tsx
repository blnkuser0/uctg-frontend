"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "system", icon: Monitor, label: "Match system" },
  { value: "light", icon: Sun, label: "Light mode" },
  { value: "dark", icon: Moon, label: "Dark mode" },
] as const;

// `compact` is a single button that cycles system → light → dark, for the collapsed
// (icon-only) sidebar where the three-way pill doesn't fit.
export function ThemeToggle({ className, compact = false }: { className?: string; compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!mounted) {
    return <div aria-hidden className={cn("shrink-0 rounded-full bg-muted/60", compact ? "size-8" : "h-7 w-[4.75rem]", className)} />;
  }

  const activeIndex = Math.max(
    OPTIONS.findIndex((option) => option.value === theme),
    0
  );

  function applyTheme(value: string, event: React.MouseEvent<HTMLButtonElement>) {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!("startViewTransition" in document) || prefersReducedMotion) {
      setTheme(value);
      return;
    }

    const { clientX, clientY } = event;
    document.documentElement.style.setProperty("--theme-toggle-x", `${clientX}px`);
    document.documentElement.style.setProperty("--theme-toggle-y", `${clientY}px`);

    document.startViewTransition(() => {
      flushSync(() => setTheme(value));
    });
  }

  if (compact) {
    const current = OPTIONS[activeIndex];
    const next = OPTIONS[(activeIndex + 1) % OPTIONS.length];
    const CurrentIcon = current.icon;
    return (
      <button
        type="button"
        aria-label={`${current.label} — switch to ${next.label}`}
        title={`${current.label} — click for ${next.label}`}
        onClick={(event) => applyTheme(next.value, event)}
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground",
          className
        )}
      >
        <CurrentIcon className="size-4" />
      </button>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className={cn("relative inline-grid shrink-0 grid-cols-3 rounded-full border border-border bg-muted/60 p-0.5", className)}
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 rounded-full bg-background shadow-sm transition-transform duration-300 ease-out"
        style={{ width: "calc((100% - 0.25rem) / 3)", transform: `translateX(${activeIndex * 100}%)` }}
      />
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = theme === value || (!theme && value === "system");
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={(event) => applyTheme(value, event)}
            className={cn(
              "relative z-10 flex size-6 items-center justify-center rounded-full transition-colors duration-200",
              active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-3.5" />
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  if (!mounted) {
    return <Button aria-label="Toggle color theme" className={className} size="icon" variant="ghost" disabled />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className={className}
      size="icon"
      variant="ghost"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}

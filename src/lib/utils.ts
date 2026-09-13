export { cn } from "cn";

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDueDate(date: string | Date | null | undefined): { label: string; tone: "gray" | "amber" | "red" } {
  if (!date) return { label: "", tone: "gray" };
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = d.getTime() - now.setHours(0, 0, 0, 0);
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (diffDays < 0) return { label, tone: "red" };
  if (diffDays <= 2) return { label, tone: "amber" };
  return { label, tone: "gray" };
}


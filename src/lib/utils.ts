export { cn } from "cn";

// The org operates on Philippine time — clock events, deadlines, and leave
// dates should always read as PH time regardless of the viewer's own device
// timezone. PH is a fixed UTC+8 offset year-round (no DST).
export const PH_TIME_ZONE = "Asia/Manila";
const PH_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: PH_TIME_ZONE });
}

/** Local-calendar-day key (YYYY-MM-DD) for a date constructed purely for UI grid purposes (e.g. MonthGrid's per-cell dates). */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** PH-calendar-day key (YYYY-MM-DD) for a real instant (e.g. "now", or a fetched timestamp) — matches the backend's day-key convention. */
export function toPhDateKey(date: Date): string {
  const shifted = new Date(date.getTime() + PH_OFFSET_MS);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, "0");
  const day = String(shifted.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Formats a real timestamp as a PH clock time, e.g. "9:03 AM". */
export function formatClockTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", timeZone: PH_TIME_ZONE });
}

/** Formats a real timestamp as a PH date + time, e.g. "Sep 14, 9:03 AM". */
export function formatClockDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: PH_TIME_ZONE,
  });
}

// Same five tones the main Sidebar's nav sections already rotate through — reused here so a
// person's avatar color is consistent with the rest of the app's palette instead of introducing
// a new one just for chat. Deterministic per id, so a given person is always the same color.
const AVATAR_GRADIENTS = [
  "bg-gradient-to-br from-sky-500 to-sky-600",
  "bg-gradient-to-br from-violet-500 to-violet-600",
  "bg-gradient-to-br from-amber-500 to-amber-600",
  "bg-gradient-to-br from-emerald-500 to-emerald-600",
  "bg-gradient-to-br from-orange-500 to-orange-600",
];

export function avatarGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
}

/** Day-divider label for a chat message list: "Today", "Yesterday", or a full date further back. */
export function formatDayLabel(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const key = toPhDateKey(d);
  const today = toPhDateKey(new Date());
  const yesterday = toPhDateKey(new Date(Date.now() - DAY_MS));
  if (key === today) return "Today";
  if (key === yesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric", timeZone: PH_TIME_ZONE });
}

export function formatDueDate(date: string | Date | null | undefined): { label: string; tone: "gray" | "amber" | "red" } {
  if (!date) return { label: "", tone: "gray" };
  const d = typeof date === "string" ? new Date(date) : date;

  const [ty, tm, td] = toPhDateKey(new Date()).split("-").map(Number);
  const todayPhStart = Date.UTC(ty, tm - 1, td) - PH_OFFSET_MS;
  const diffDays = Math.round((d.getTime() - todayPhStart) / DAY_MS);

  const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: PH_TIME_ZONE });
  if (diffDays < 0) return { label, tone: "red" };
  if (diffDays <= 2) return { label, tone: "amber" };
  return { label, tone: "gray" };
}


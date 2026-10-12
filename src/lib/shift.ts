import { ShiftType } from "@/types/user";
import { PH_TIME_ZONE } from "./utils";

// Mirrors backend/src/constants/shift.ts — which timezone's midnight governs a person's own
// attendance calendar: PH time for a morning shift, US Eastern for a night shift aligned to US
// business hours (so their evening-start shift never crosses its own day boundary).
export const SHIFT_TIME_ZONE: Record<ShiftType, string> = {
  morning: PH_TIME_ZONE,
  night: "America/New_York",
};

export function shiftTimeZone(shiftType: ShiftType | undefined): string {
  return SHIFT_TIME_ZONE[shiftType ?? "morning"];
}

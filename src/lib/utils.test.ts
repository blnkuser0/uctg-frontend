import { describe, it, expect, vi, afterEach } from "vitest";
import { toDateKey, toPhDateKey, formatClockTime, formatDueDate } from "./utils";

describe("toDateKey", () => {
  it("formats a synthetic local date's own components, unaffected by timezone shifting", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toDateKey(new Date(2026, 11, 31))).toBe("2026-12-31");
  });
});

describe("toPhDateKey", () => {
  it("maps a UTC instant to the PH calendar day it falls on (UTC+8)", () => {
    // 16:30 UTC on Jan 15 = 00:30 PH on Jan 16 — already past PH midnight.
    expect(toPhDateKey(new Date("2026-01-15T16:30:00Z"))).toBe("2026-01-16");
    // 15:30 UTC on Jan 15 = 23:30 PH, still Jan 15.
    expect(toPhDateKey(new Date("2026-01-15T15:30:00Z"))).toBe("2026-01-15");
  });

  it("lands exactly on PH midnight without drifting a day either way", () => {
    // 16:00:00 UTC is exactly 00:00:00 PH.
    expect(toPhDateKey(new Date("2026-03-01T16:00:00Z"))).toBe("2026-03-02");
    expect(toPhDateKey(new Date("2026-03-01T15:59:59Z"))).toBe("2026-03-01");
  });
});

describe("formatClockTime", () => {
  it("renders a UTC instant as its PH clock time, not the local machine's zone", () => {
    // 01:00 UTC = 09:00 PH.
    const result = formatClockTime(new Date("2026-01-15T01:00:00Z"));
    expect(result).toMatch(/9:00/);
    expect(result).toMatch(/AM/i);
  });
});

describe("formatDueDate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns gray for a date more than 2 days out", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T04:00:00Z")); // PH noon, June 10
    const { tone } = formatDueDate("2026-06-20");
    expect(tone).toBe("gray");
  });

  it("returns amber for a date within the next 2 days", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T04:00:00Z"));
    const { tone } = formatDueDate("2026-06-11");
    expect(tone).toBe("amber");
  });

  it("returns red for a date already in the past", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T04:00:00Z"));
    const { tone } = formatDueDate("2026-06-01");
    expect(tone).toBe("red");
  });

  it("returns a gray, empty label when given no date", () => {
    expect(formatDueDate(null)).toEqual({ label: "", tone: "gray" });
    expect(formatDueDate(undefined)).toEqual({ label: "", tone: "gray" });
  });
});

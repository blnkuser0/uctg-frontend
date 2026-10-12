import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { TodayLogList } from "./TodayLogList";
import type { TimeLog } from "@/types/timeLog";

function log(id: string, type: TimeLog["type"], timestamp: string, note: string | null = null): TimeLog {
  return { _id: id, organizationId: "org", userId: "user", type, timestamp, note };
}

describe("Shift activity break labels", () => {
  it("pairs a completed overnight nap with its end and keeps subsequent regular breaks distinct", () => {
    const logs = [
      log("1", "time-in", "2026-10-13T15:00:00Z"),
      log("2", "break-in", "2026-10-13T15:50:00Z", "nap"),
      log("3", "break-out", "2026-10-13T16:10:00Z"),
      log("4", "break-in", "2026-10-13T17:00:00Z"),
      log("5", "break-out", "2026-10-13T17:30:00Z"),
    ];
    // API ordering must not affect how the start/end events are associated.
    render(<TodayLogList logs={[logs[4], logs[1], logs[3], logs[0], logs[2]]} />);
    const items = screen.getAllByRole("listitem");
    ["Lunch break ended", "Lunch break started", "Nap break ended", "Nap break started", "Shift started"]
      .forEach((label, index) => expect(within(items[index]).getByText(label)).toBeInTheDocument());
  });

  it("shows an active nap without inventing an end event", () => {
    render(<TodayLogList logs={[
      log("1", "time-in", "2026-10-13T15:00:00Z"),
      log("2", "break-in", "2026-10-13T16:00:00Z", "nap"),
    ]} />);
    expect(screen.getByText("Nap break started")).toBeInTheDocument();
    expect(screen.queryByText("Nap break ended")).not.toBeInTheDocument();
  });
});

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskDeadlinePill } from "./TaskDeadlinePill";

describe("TaskDeadlinePill", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when there is no deadline", () => {
    const { container } = render(<TaskDeadlinePill deadline={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("flags an overdue deadline in the red tone", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T04:00:00Z"));
    render(<TaskDeadlinePill deadline="2026-06-01" />);
    expect(screen.getByText(/Jun 1/)).toHaveClass("text-destructive");
  });

  it("flags a due-soon deadline in the amber tone", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-10T04:00:00Z"));
    render(<TaskDeadlinePill deadline="2026-06-11" />);
    expect(screen.getByText(/Jun 11/)).toHaveClass("text-amber-600");
  });
});

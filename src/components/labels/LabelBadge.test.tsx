import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LabelBadge } from "./LabelBadge";

describe("LabelBadge", () => {
  it("renders the label's name and applies its color", () => {
    render(<LabelBadge label={{ name: "Urgent", color: "#f59e0b" }} />);

    const badge = screen.getByText("Urgent");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveStyle({ color: "rgb(245, 158, 11)" });
  });
});

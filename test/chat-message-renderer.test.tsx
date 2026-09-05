import { render, screen } from "@testing-library/react";
import type { UIMessage } from "ai";
import { describe, expect, it } from "vitest";
import { ChatMessageRenderer, SpendingSummaryCard, ToolSummaryPart } from "@/components/ChatMessageRenderer";

const message = (parts: UIMessage["parts"], role: UIMessage["role"] = "assistant") =>
  ({ id: `${role}-1`, role, parts } as UIMessage);

const summary = {
  period: "month",
  totalSpent: 600,
  byCategory: [
    { category: "food", amount: 420, percentage: 70 },
    { category: "transport", amount: 180, percentage: 30 },
  ],
};

describe("chat message renderer", () => {
  it("renders user and assistant messages distinctly", () => {
    render(
      <>
        <div role="group" aria-label="User message"><ChatMessageRenderer message={message([{ type: "text", text: "How much did I spend?" }], "user")} /></div>
        <div role="group" aria-label="Assistant message"><ChatMessageRenderer message={message([{ type: "text", text: "You spent $600 this month." }])} /></div>
      </>,
    );

    expect(screen.getByRole("group", { name: "User message" })).toHaveTextContent("How much did I spend?");
    expect(screen.getByRole("group", { name: "Assistant message" })).toHaveTextContent("You spent $600 this month.");
  });

  it("renders the tool loading state", () => {
    render(<ToolSummaryPart part={{ state: "input-available", input: { period: "month" } }} />);
    expect(screen.getByRole("status")).toHaveTextContent("Fetching your month spending");
  });

  it("renders a successful tool result", () => {
    render(<ToolSummaryPart part={{ state: "output-available", output: summary }} />);
    expect(screen.getByRole("region", { name: "Spending summary" })).toHaveTextContent("$600");
    expect(screen.getByText("food")).toBeInTheDocument();
    expect(screen.getByText("70% of total")).toBeInTheDocument();
  });

  it("renders a tool error state", () => {
    render(<ToolSummaryPart part={{ state: "output-error", errorText: "No data found." }} />);
    expect(screen.getByRole("alert")).toHaveTextContent("No spending data for that period");
    expect(screen.getByRole("alert")).toHaveTextContent("No data found.");
  });

  it("renders a summary card with total and category breakdown", () => {
    render(<SpendingSummaryCard output={summary} />);
    expect(screen.getByText("Total spent")).toBeInTheDocument();
    expect(screen.getByText("$420")).toBeInTheDocument();
    expect(screen.getByText("$180")).toBeInTheDocument();
    expect(screen.getByText("2 categories")).toBeInTheDocument();
  });
});

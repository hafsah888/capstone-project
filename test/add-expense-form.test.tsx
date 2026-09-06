import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AddExpenseForm from "@/components/AddExpenseForm";
import { vi } from "vitest";

vi.mock("@/lib/firebase/expenses", () => ({
  addExpense: vi.fn().mockResolvedValue(undefined),
  getSettings: vi.fn().mockResolvedValue({ categories: ["Food", "Transport", "Housing", "Entertainment", "Shopping", "Utilities", "Health"] }),
  defaultSettings: { categories: ["Food", "Transport", "Housing", "Entertainment", "Shopping", "Utilities", "Health"] },
}));

describe("AddExpenseForm", () => {
  it("shows a validation error for an empty amount", async () => {
    const user = userEvent.setup();
    render(<AddExpenseForm />);

    await user.selectOptions(screen.getByLabelText("Category"), "Food");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(screen.getByRole("alert")).toHaveTextContent("amount greater than zero");
  });

  it("rejects a negative amount", async () => {
    const user = userEvent.setup();
    render(<AddExpenseForm />);

    await user.type(screen.getByLabelText("Amount"), "-12");
    await user.selectOptions(screen.getByLabelText("Category"), "Food");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(screen.getByRole("alert")).toHaveTextContent("amount greater than zero");
  });

  it("submits valid expense data successfully", async () => {
    const user = userEvent.setup();
    render(<AddExpenseForm />);

    await user.type(screen.getByLabelText("Amount"), "24.50");
    await user.selectOptions(screen.getByLabelText("Category"), "Food");
    await user.click(screen.getByRole("button", { name: "Add expense" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Expense added successfully");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

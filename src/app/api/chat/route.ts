import { convertToModelMessages, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { model, MAX_TOKENS, SYSTEM_PROMPT } from "@/lib/ai/config";
import { getExpenses, getExpensesForMonth, getSettings } from "@/lib/firebase/expenses";

export const runtime = "nodejs";
export const maxDuration = 30;

export const getSpendingSummaryTool = tool({
  description:
    "Get a summarized spending overview for a specific time period, optionally filtered by category.",
  inputSchema: z.object({
    category: z
      .string()
      .optional()
      .describe("Filter by expense category, e.g. 'food', 'transport'. Omit for all categories."),
    period: z
      .enum(["week", "month", "year"])
      .describe("Time period to summarize"),
  }),
  execute: async ({ category, period }) => {
    const now = new Date();
    const settings = await getSettings();
    const expenses = period === "month"
      ? await getExpensesForMonth(now.getFullYear(), now.getMonth() + 1)
      : await getExpenses();
    const periodExpenses = period === "year"
      ? expenses.filter((expense) => new Date(expense.date).getFullYear() === now.getFullYear())
      : period === "week"
        ? expenses.filter((expense) => now.getTime() - new Date(expense.date).getTime() <= 7 * 24 * 60 * 60 * 1000)
        : expenses;
    const normalizedCategory = category?.trim().toLowerCase();
    const filteredExpenses = normalizedCategory
      ? periodExpenses.filter((expense) => expense.category.toLowerCase() === normalizedCategory)
      : periodExpenses;

    if (filteredExpenses.length === 0) {
      throw new Error(`No spending data found for "${category ?? "that category"}" in the ${period} period.`);
    }

    const totals = filteredExpenses.reduce<Record<string, number>>((result, expense) => {
      result[expense.category] = (result[expense.category] ?? 0) + expense.amount;
      return result;
    }, {});
    const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const byCategory = Object.entries(totals)
      .map(([name, amount]) => ({ category: name, amount, percentage: Number(((amount / totalSpent) * 100).toFixed(1)) }))
      .sort((a, b) => b.amount - a.amount);

    return {
      period,
      totalSpent,
      byCategory,
      transactionCount: filteredExpenses.length,
      currency: settings.currency,
    };
  },
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || !Array.isArray(body.messages)) {
      return Response.json(
        { error: "A messages array is required." },
        { status: 400 },
      );
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GOOGLE_GENERATIVE_AI_API_KEY is not configured on the server." },
        { status: 500 },
      );
    }

    const messages = body.messages as UIMessage[];
    const settings = await getSettings();

    const result = streamText({
      model,
      system: `${SYSTEM_PROMPT}\nAlways format monetary amounts using the user's selected currency: ${settings.currency}.`,
      maxOutputTokens: MAX_TOKENS,
      messages: await convertToModelMessages(messages),
      tools: {
        getSpendingSummary: getSpendingSummaryTool,
      },
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
    });
  } catch (error) {
    console.error("Chat route error:", error);
    return Response.json(
      { error: "Unable to generate a response right now." },
      { status: 500 },
    );
  }
}

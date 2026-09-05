import type { UIMessage } from "ai";
import { formatCurrency } from "@/lib/formatCurrency";

type ToolPart = {
  toolCallId?: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

type SpendingSummary = {
  period: string;
  totalSpent: number;
  byCategory: Array<{ category: string; amount: number; percentage: number }>;
  note?: string;
  currency?: "USD" | "PKR" | "INR" | "EUR";
};

export function SpendingSummaryCard({ output }: { output: SpendingSummary }) {
  return (
    <section aria-label="Spending summary" className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-slate-800 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">Spending summary</p>
          <p className="mt-1 text-lg font-semibold">{output.period}</p>
        </div>
        <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
          {output.byCategory.length} categories
        </div>
      </div>
      <div className="mt-3 border-t border-emerald-100 pt-3">
        <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Total spent</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{formatCurrency(output.totalSpent, output.currency)}</p>
      </div>
      <div className="mt-4 space-y-3">
        {output.byCategory.map((item) => (
          <div key={item.category} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="capitalize">{item.category}</span>
              <span>{formatCurrency(item.amount, output.currency)}</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(item.percentage, 8)}%` }} />
            </div>
            <div className="text-[10px] text-slate-500">{item.percentage}% of total</div>
          </div>
        ))}
      </div>
      {output.note && <p className="mt-3 border-t border-emerald-100 pt-3 text-[11px] italic text-emerald-700">{output.note}</p>}
    </section>
  );
}

export function ToolSummaryPart({ part }: { part: ToolPart }) {
  const period =
    typeof part.input === "object" && part.input !== null && "period" in part.input
      ? String(part.input.period)
      : "selected";

  if (part.state === "input-streaming" || part.state === "input-available") {
    return (
      <div role="status" className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-blue-700">
        <span className={part.state === "input-available" ? "inline-flex h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" : "mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-slate-400"} />
        {part.state === "input-available" ? `Fetching your ${period} spending...` : "Preparing request..."}
      </div>
    );
  }

  if (part.state === "output-available" && isSummaryOutput(part.output)) {
    return <SpendingSummaryCard output={part.output} />;
  }

  if (part.state === "output-error") {
    return (
      <div role="alert" className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-rose-800 shadow-sm">
        <p className="text-sm font-semibold">No spending data for that period</p>
        <p className="mt-1 text-sm text-rose-700">{part.errorText ?? "Try a different period like month or year."}</p>
      </div>
    );
  }

  return null;
}

function isSummaryOutput(value: unknown): value is SpendingSummary {
  if (typeof value !== "object" || value === null) return false;
  const output = value as { period?: unknown; totalSpent?: unknown; byCategory?: unknown };
  return typeof output.period === "string" && typeof output.totalSpent === "number" && Array.isArray(output.byCategory);
}

export function ChatMessageRenderer({ message }: { message: UIMessage }) {
  return (
    <>
      {message.parts.map((part, index) => {
        if (part.type === "text") {
          return <p key={`${message.id ?? message.role}-${index}`} className="whitespace-pre-wrap break-words">{part.text}</p>;
        }
        if (part.type === "tool-getSpendingSummary") {
          return <ToolSummaryPart key={`${message.id ?? "assistant"}-${part.toolCallId}`} part={part} />;
        }
        return null;
      })}
    </>
  );
}

"use client";

import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatMessageRenderer } from "@/components/ChatMessageRenderer";

const examplePrompts = [
  "How much did I spend on food this month?",
  "What are my biggest expenses this year?",
  "Can you suggest a realistic budget for this month?",
];

export default function ExpenseChat() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [failedRetryText, setFailedRetryText] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
    onError: () => {
      const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
      const retryText = lastUserMessage
        ? lastUserMessage.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join(" ")
            .trim()
        : "";

      setFailedRetryText(retryText || null);
      setIsRetrying(false);
    },
  });

  const isActive = status === "submitted" || status === "streaming";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const lastAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );

  const lastAssistantHasText = (() => {
    if (!lastAssistantMessage) {
      return false;
    }

    return lastAssistantMessage.parts.some(
      (part) =>
        part.type === "text" &&
        typeof part.text === "string" &&
        part.text.trim().length > 0,
    );
  })();

  const showAssistantSkeleton =
    status === "submitted" || (status === "streaming" && !lastAssistantHasText);

  const retryMessageText = failedRetryText ??
    (() => {
      const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");

      return lastUserMessage
        ? lastUserMessage.parts
            .filter((part) => part.type === "text")
            .map((part) => part.text)
            .join(" ")
            .trim()
        : "";
    })();

  const shouldShowInlineError = Boolean(error) && !isActive && !!retryMessageText;

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - (container.scrollTop + container.clientHeight);
      const nearBottom = distanceFromBottom <= 40;

      setIsAtBottom(nearBottom);
      setShowJumpToLatest(!nearBottom);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom("smooth");
      setShowJumpToLatest(false);
    }
  }, [messages, status, isAtBottom]);

  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();

    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return;
    }

    sendMessage({ text: trimmedInput });
    setInput("");
    setFailedRetryText(null);
    setIsRetrying(false);
  };

  const handleRetryFailedMessage = () => {
    if (!retryMessageText || isRetrying || isActive) {
      return;
    }

    setIsRetrying(true);
    sendMessage({ text: retryMessageText });
    setInput("");
    setFailedRetryText(null);
  };

  const handlePromptClick = (prompt: string) => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || isActive) {
      return;
    }

    sendMessage({ text: trimmedPrompt });
    setInput("");
    setFailedRetryText(null);
    setIsRetrying(false);
  };

  const renderToolSummaryPart = (part: any) => {
    const periodLabel = part.input?.period ?? "selected";

    switch (part.state) {
      case "input-streaming":
        return (
          <div
            key={part.toolCallId}
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
              Preparing request...
            </div>
          </div>
        );

      case "input-available":
        return (
          <div
            key={part.toolCallId}
            className="w-full rounded-2xl border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-blue-700 transition-opacity duration-200 ease-out"
            style={{ opacity: 1 }}
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
              Fetching your {periodLabel} spending...
            </div>
          </div>
        );

      case "output-available": {
        const summary = part.output ?? {
          period: periodLabel,
          totalSpent: 0,
          byCategory: [],
        };

        return (
          <div
            key={part.toolCallId}
            className="w-full rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-slate-800 shadow-sm transition-opacity duration-200 ease-out"
            style={{ opacity: 1 }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Spending summary
                </p>
                <p className="mt-1 text-lg font-semibold">{summary.period}</p>
              </div>
              <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {summary.byCategory.length} categories
              </div>
            </div>

            <div className="mt-3 border-t border-emerald-100 pt-3">
              <p className="text-xs uppercase tracking-[0.1em] text-slate-500">Total spent</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                ${summary.totalSpent.toLocaleString()}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {summary.byCategory.map((item: any) => (
                <div key={`${part.toolCallId}-${item.category}`} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="capitalize">{item.category}</span>
                    <span>${item.amount.toLocaleString()}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${Math.max(item.percentage, 8)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500">{item.percentage}% of total</div>
                </div>
              ))}
            </div>

            {summary.note ? (
              <p className="mt-3 border-t border-emerald-100 pt-3 text-[11px] italic text-emerald-700">
                {summary.note}
              </p>
            ) : null}
          </div>
        );
      }

      case "output-error":
        return (
          <div
            key={part.toolCallId}
            className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-rose-800 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-base">
                ⚠️
              </div>
              <div>
                <p className="text-sm font-semibold">No spending data for that period</p>
                <p className="mt-1 text-sm text-rose-700">
                  {part.errorText ?? "Try a different period like month or year."}
                </p>
                <p className="mt-2 text-xs font-medium text-rose-600">Try again with another time range.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderMessageContent = (message: UIMessage) => {
    return <ChatMessageRenderer message={message} />;
  };

  const renderAssistantSkeleton = () => (
    <div className="flex justify-start transition-opacity duration-200 ease-out">
      <div className="max-w-[85%] rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:max-w-[75%]">
        <div className="space-y-2">
          <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-full animate-pulse rounded-full bg-slate-200" />
          <div className="h-3 w-5/6 animate-pulse rounded-full bg-slate-200" />
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <div className="h-2.5 w-20 animate-pulse rounded-full bg-slate-200" />
              <div className="h-4 w-16 animate-pulse rounded-full bg-slate-200" />
            </div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
          </div>

          <div className="mt-4 space-y-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="h-2.5 w-16 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-2.5 w-12 animate-pulse rounded-full bg-slate-200" />
                </div>
                <div className="h-2.5 w-full animate-pulse rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-72px)] min-h-0 flex-col bg-slate-50 dark:bg-slate-900">
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto overscroll-contain px-3 pb-28 pt-4 sm:px-5"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="mx-auto w-full max-w-3xl space-y-3">
            {messages.length === 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-5 text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">How can I help with your spending?</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Ask about your budget, category trends, or what to watch next month.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {examplePrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handlePromptClick(prompt)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => {
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id ?? `${message.role}-${index}`}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm sm:max-w-[75%] ${
                      isUser
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-800"
                    }`}
                  >
                    <div className="text-sm leading-6">{renderMessageContent(message)}</div>
                  </div>
                </div>
              );
            })}

            {shouldShowInlineError && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 shadow-sm sm:max-w-[75%]">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
                      !
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-medium">The last response did not complete.</p>
                      <p className="mt-1 text-xs text-amber-700">
                        {error?.message ?? "The request failed. Please retry."}
                      </p>

                      <button
                        type="button"
                        onClick={handleRetryFailedMessage}
                        disabled={isRetrying || isActive}
                        className="mt-2 rounded-md border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isRetrying ? "Retrying..." : "Retry"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showAssistantSkeleton && renderAssistantSkeleton()}
          </div>
        </div>

        {showJumpToLatest && (
          <button
            type="button"
            onClick={() => {
              scrollToBottom("smooth");
              setShowJumpToLatest(false);
            }}
            className="absolute bottom-28 right-4 rounded-full bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg transition hover:bg-slate-700"
          >
            Jump to latest
          </button>
        )}

        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 sm:px-5">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit(event);
            }}
            className="mx-auto flex w-full max-w-3xl items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={1}
              disabled={!isMounted || isActive}
              placeholder={isActive ? "Assistant is replying..." : "Ask about your spending..."}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  if (input.trim()) {
                    handleSubmit(event);
                  }
                }
              }}
            />

            <div className="flex items-center gap-2">
              {isActive && (
                <button
                  type="button"
                  onClick={() => stop()}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Stop
                </button>
              )}

              <button
                type="submit"
                disabled={!isMounted || isActive || !input.trim()}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

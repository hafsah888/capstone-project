"use client";

import { DefaultChatTransport, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useRef, useState } from "react";

export default function ExpenseChat() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isActive = status === "submitted" || status === "streaming";

  const lastAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant"),
    [messages],
  );

  const lastAssistantHasText = (() => {
    if (!lastAssistantMessage) {
      return false;
    }

    return lastAssistantMessage.parts.some(
      (part) => part.type === "text" && typeof part.text === "string" && part.text.trim().length > 0,
    );
  })();

  const isThinking = status === "submitted" || (status === "streaming" && !lastAssistantHasText);

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
  };

  const renderMessageText = (message: UIMessage) => {
    const textParts = message.parts.filter((part) => part.type === "text");

    if (textParts.length > 0) {
      return textParts.map((part, index) => (
        <p key={`${message.id ?? "message"}-${index}`} className="whitespace-pre-wrap">
          {part.text}
        </p>
      ));
    }

    return <p className="whitespace-pre-wrap">{message.id ?? ""}</p>;
  };

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col bg-slate-50">
      <div className="relative flex-1 overflow-hidden">
        <div ref={scrollContainerRef} className="h-full overflow-y-auto px-3 pb-28 pt-4 sm:px-5">
          <div className="mx-auto w-full max-w-3xl space-y-3">
            {messages.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
                Ask about spending trends, category changes, or how to stretch your budget.
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
                    <div className="text-sm leading-6">{renderMessageText(message)}</div>
                  </div>
                </div>
              );
            })}

            {isThinking && (
              <div className="flex justify-start transition-opacity duration-200 ease-out">
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                    </span>
                    Thinking...
                  </span>
                </div>
              </div>
            )}
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

        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-sm sm:px-5">
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
              disabled={isActive}
              placeholder={isActive ? "Assistant is replying..." : "Ask about your spending..."}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
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
                disabled={isActive || !input.trim()}
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

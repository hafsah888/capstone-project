"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SendButtonState = "idle" | "loading" | "success" | "error";

type SendButtonProps = {
  onSend: () => Promise<boolean>;
  disabled?: boolean;
  className?: string;
  idleLabel?: string;
  loadingLabel?: string;
  successLabel?: string;
  errorLabel?: string;
};

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function getRandomDelay() {
  return Math.floor(Math.random() * 1201) + 800;
}

export function SendButton({
  onSend,
  disabled = false,
  className = "",
  idleLabel = "Send",
  loadingLabel = "Sending...",
  successLabel = "Sent",
  errorLabel = "Retry",
}: SendButtonProps) {
  const [state, setState] = useState<SendButtonState>("idle");
  const [reducedMotion, setReducedMotion] = useState(false);
  const requestIdRef = useRef(0);
  const isBusyRef = useRef(false);

  useEffect(() => {
    const media = window.matchMedia(reducedMotionQuery);

    const handleChange = () => setReducedMotion(media.matches);
    handleChange();
    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, []);

  const isDisabled = disabled || state === "loading";
  const stateLabel = useMemo(() => {
    if (state === "loading") return loadingLabel;
    if (state === "success") return successLabel;
    if (state === "error") return errorLabel;
    return idleLabel;
  }, [errorLabel, idleLabel, loadingLabel, state, successLabel]);

  const handleAction = async () => {
    if (isDisabled || isBusyRef.current) {
      return;
    }

    isBusyRef.current = true;
    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

    setState("loading");

    try {
      const shouldSucceed = await onSend();

      if (currentRequestId !== requestIdRef.current || !shouldSucceed) {
        return;
      }

      setState("success");

      if (!reducedMotion) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      if (currentRequestId === requestIdRef.current) {
        setState("idle");
      }
    } catch {
      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      setState("error");
    } finally {
      if (currentRequestId === requestIdRef.current) {
        isBusyRef.current = false;
      }
    }
  };

  const transitionClass = reducedMotion
    ? "transition-opacity duration-150 ease-linear"
    : "transition-all duration-200 ease-out";

  const getVisualContent = () => {
    if (state === "loading") {
      return (
        <span className="relative inline-flex items-center justify-center gap-2">
          <span
            className={`inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-white/70 border-t-transparent ${
              reducedMotion ? "animate-none" : "animate-spin"
            }`}
          />
          <span>{loadingLabel}</span>
        </span>
      );
    }

    if (state === "success") {
      return (
        <span className="inline-flex items-center justify-center gap-2">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`h-4 w-4 ${reducedMotion ? "opacity-100" : "transition-all duration-200 ease-out"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12.5 9.4 16.9 19 7.3" />
          </svg>
          <span>{successLabel}</span>
        </span>
      );
    }

    if (state === "error") {
      return <span>{errorLabel}</span>;
    }

    return <span>{idleLabel}</span>;
  };

  return (
    <button
      type="button"
      onClick={handleAction}
      disabled={isDisabled}
      aria-live="polite"
      className={[
        "group relative inline-flex min-w-[11rem] items-center justify-center overflow-hidden rounded-xl border px-5 py-3 text-sm font-semibold tracking-[0.01em] shadow-sm outline-none",
        "transform-gpu transition-[transform,background-color,color,box-shadow,opacity] duration-200 ease-out",
        state === "idle" && "border-indigo-600 bg-indigo-600 text-white hover:-translate-y-0.5 hover:bg-indigo-500",
        state === "loading" && "border-indigo-500 bg-indigo-500 text-white",
        state === "success" && "border-emerald-600 bg-emerald-600 text-white",
        state === "error" && "border-rose-600 bg-rose-600 text-white",
        disabled && "cursor-not-allowed opacity-70",
        "focus-visible:ring-4 focus-visible:ring-indigo-200 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        reducedMotion && "transition-opacity duration-150 ease-linear",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        animation: state === "error" && !reducedMotion ? "shake 220ms ease-in-out 1" : undefined,
      }}
    >
      <span className="pointer-events-none absolute inset-0 opacity-0" aria-hidden="true" />
      <span
        className={[
          "relative z-10 inline-flex items-center justify-center gap-2 whitespace-nowrap",
          "overflow-hidden",
          transitionClass,
        ].join(" ")}
      >
        <span
          className={[
            "inline-flex items-center justify-center",
            "transition-all duration-200 ease-out",
            state === "loading" ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0",
            reducedMotion && "duration-0",
          ].join(" ")}
        >
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
        </span>

        <span
          className={[
            "inline-flex items-center justify-center",
            "transition-all duration-200 ease-out",
            state === "loading" ? "-translate-x-2 opacity-0" : "translate-x-0 opacity-100",
            reducedMotion && "duration-0",
          ].join(" ")}
        >
          {getVisualContent()}
        </span>
      </span>

      <span className="sr-only">{stateLabel}</span>

      <style jsx>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .send-button-shake {
            animation: none !important;
          }
        }
      `}</style>
    </button>
  );
}

export function createDemoSendAction(nextOutcome: "random" | "success" | "fail") {
  return async () => {
    const delay = getRandomDelay();
    await new Promise((resolve) => setTimeout(resolve, delay));

    if (nextOutcome === "fail") {
      return false;
    }

    if (nextOutcome === "success") {
      return true;
    }

    return Math.random() > 0.2;
  };
}

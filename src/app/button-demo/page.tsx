"use client";

import { useState } from "react";
import { SendButton, createDemoSendAction } from "@/components/SendButton";

export default function ButtonDemoPage() {
  const [nextOutcome, setNextOutcome] = useState<"random" | "success" | "fail">("random");

  const handleSend = async () => {
    const action = createDemoSendAction(nextOutcome);
    const result = await action();
    setNextOutcome("random");
    return result;
  };

  return (
    <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setNextOutcome("success")}
            className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
          >
            Force next click: success
          </button>

          <button
            type="button"
            onClick={() => setNextOutcome("fail")}
            className="rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
          >
            Force next click: fail
          </button>
        </div>

        <div className="mb-6 flex justify-center">
          <SendButton onSend={handleSend} />
        </div>

        <p className="text-sm leading-6 text-slate-600">
          The transitions intentionally lean on short 200ms ease-out motion for the hover and state
          changes, with a longer 800ms success hold so the confirmation has enough time to read. The small
          shake on the error state is kept intentionally brief and is skipped entirely under
          reduced-motion settings so the feedback remains clear without uncomfortable motion.
        </p>
      </div>
    </main>
  );
}

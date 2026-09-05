"use client";

export default function ChatErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-2xl">
          ⚠️
        </div>

        <h2 className="mt-5 text-2xl font-semibold text-slate-900">Something went wrong</h2>
        <p className="mt-2 text-sm text-slate-600">
          The chat assistant hit an unexpected error. Please try again.
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 px-3 py-2 text-left text-xs text-slate-500">
          {error.message || "Unexpected chat failure."}
        </div>

        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

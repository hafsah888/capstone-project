"use client";

import dynamic from "next/dynamic";

const PiggyBank3D = dynamic(() => import("@/components/PiggyBank3D"), {
  ssr: false,
  loading: () => <div className="h-[390px] animate-pulse rounded-3xl border border-slate-200 bg-slate-100" aria-label="Loading savings companion" />,
});

export default PiggyBank3D;
"use client";

import { useEffect, useState } from "react";

const STEPS = ["Reading your resume", "Picking your strongest projects", "Writing your bio", "Laying out your experience", "Designing your contact card"];

/** Shown while Claude builds the portfolio (usually 30-60 seconds). */
export function BuildingStep({ error, onRetry }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (error) return;
    const t = setInterval(() => setI((n) => Math.min(n + 1, STEPS.length - 1)), 9000);
    return () => clearInterval(t);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-6 text-center">
      {error ? (
        <>
          <p className="font-sora text-2xl font-semibold">That didn&apos;t work</p>
          <p className="text-[15px] text-ink-2">{error}</p>
          <button type="button" onClick={onRetry} className="rounded-2xl bg-scarlet px-6 py-3.5 font-semibold text-white">
            Try again
          </button>
        </>
      ) : (
        <>
          <span className="relative grid h-24 w-24 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-scarlet/20" />
            <span className="h-14 w-14 animate-pulse rounded-2xl bg-scarlet" />
          </span>
          <div>
            <p className="font-sora text-2xl font-semibold">Building your Tapfolio</p>
            <p className="mt-2 text-[15px] text-ink-2">{STEPS[i]}…</p>
          </div>
          <ul className="flex flex-col gap-2 text-left text-sm">
            {STEPS.map((s, n) => (
              <li key={s} className={`flex items-center gap-2.5 ${n < i ? "text-ink" : n === i ? "text-scarlet-bright" : "text-ink-2/50"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${n <= i ? "bg-current" : "bg-line"}`} /> {s}
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

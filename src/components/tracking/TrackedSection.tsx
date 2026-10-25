"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/track";

interface TrackedSectionProps {
  id: string;
  label: string;
  className?: string;
  children: React.ReactNode;
}

const MIN_REPORT_MS = 1000;

/** Measures how long this block is at least half on screen, and reports it when the viewer moves on. */
export function TrackedSection({ id, label, className, children }: TrackedSectionProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visibleSince: number | null = null;
    let total = 0;

    const pause = () => {
      if (visibleSince !== null) total += performance.now() - visibleSince;
      visibleSince = null;
    };
    const flush = () => {
      const wasVisible = visibleSince !== null;
      pause();
      if (total >= MIN_REPORT_MS) track("dwell", id, label, Math.round(total));
      total = 0;
      if (wasVisible && document.visibilityState === "visible") visibleSince = performance.now();
    };

    // "In view" = half the block is showing, or (for blocks taller than the
    // screen) it fills at least half the screen.
    const inView = (e: IntersectionObserverEntry) =>
      e.intersectionRect.height >= 0.5 * Math.min(e.boundingClientRect.height, window.innerHeight);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (inView(entry) && document.visibilityState === "visible") visibleSince ??= performance.now();
        else if (visibleSince !== null) flush();
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] },
    );
    io.observe(el);

    const onVisibility = () => (document.visibilityState === "hidden" ? flush() : undefined);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [id, label]);

  return (
    <div ref={ref} id={id} className={className} data-section={id}>
      {children}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { initTracking, track } from "@/lib/track";

interface ViewTrackerProps {
  slug: string;
}

/**
 * Opens a viewing session when the card loads and records clicks on any
 * element marked with data-track / data-label.
 */
export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const forParam = params.get("for");
    const audience = forParam === "recruiter" || forParam === "student" ? forParam : undefined;
    initTracking(slug, params.get("ev") ?? undefined, params.get("c") ?? undefined, audience);
    const via: Record<string, string> = { tap: " via tap-to-share", qr: " via QR scan" };
    track("open", "card", `Opened card${via[params.get("src") ?? ""] ?? ""}`);

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      if (!el) return;
      track("click", el.dataset.track ?? "unknown", el.dataset.label ?? el.textContent?.trim() ?? "");
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [slug]);

  return null;
}

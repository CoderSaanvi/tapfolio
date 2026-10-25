"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

/**
 * Opens the phone's own share sheet: AirDrop on iPhone (hold the phones
 * together, or pick their phone), Quick Share on Android. Nothing to install
 * on the recruiter's side. Falls back to copying the link on desktop.
 */
export function TapShareButton({ url, title }) {
  const [status, setStatus] = useState("idle");

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: `${title} — live portfolio`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch (e) {
      // AbortError means the user closed the sheet, which is fine.
      if (!(e instanceof DOMException && e.name === "AbortError")) setStatus("failed");
    }
    setTimeout(() => setStatus("idle"), 2500);
  }

  return (
    <button
      type="button"
      onClick={share}
      className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-scarlet to-scarlet-deep px-5 py-5 font-sys text-lg font-semibold text-white shadow-save active:scale-[.99]"
    >
      <Icon name="tap" className="h-6 w-6" />
      {status === "copied" ? "Link copied" : status === "failed" ? "Couldn't open share" : "Tap to share"}
    </button>
  );
}

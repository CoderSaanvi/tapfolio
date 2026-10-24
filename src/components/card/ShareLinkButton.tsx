"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface ShareLinkButtonProps {
  title: string;
  path: string;
}

export function ShareLinkButton({ title, path }: ShareLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // User dismissed the share sheet or clipboard is blocked; nothing to do.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      data-track="share-card"
      data-label="Shared card link"
      className="flex w-full items-center justify-center gap-2 rounded-[13px] border border-line bg-white px-2.5 py-3 font-sys text-[13px] font-semibold text-ink hover:bg-scarlet/[.04]"
    >
      <Icon name="share" className="h-[18px] w-[18px] text-scarlet" />
      <span>{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}

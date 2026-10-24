"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import type { Profile } from "@/lib/types";

interface QuickActionsProps {
  profile: Profile;
}

const tile =
  "flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-wash px-1.5 py-3 text-[11.5px] text-ink no-underline active:bg-white/5";

export function QuickActions({ profile: p }: QuickActionsProps) {
  const [copied, setCopied] = useState(false);
  const links: { label: string; href: string; icon: IconName; external?: boolean }[] = [
    { label: "Call", href: `tel:${p.contact.phone}`, icon: "phone" },
    { label: "Email", href: `mailto:${p.contact.email}`, icon: "mail" },
    { label: "LinkedIn", href: p.contact.linkedin, icon: "linkedin", external: true },
  ];

  async function share() {
    const url = `${window.location.origin}/c/${p.slug}`;
    try {
      if (navigator.share) return await navigator.share({ title: `${p.firstName} ${p.lastName}`, url });
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed or clipboard blocked.
    }
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {links.map((a) => (
        <a
          key={a.label}
          href={a.href}
          {...(a.external ? { target: "_blank", rel: "noopener" } : {})}
          data-track={`quick:${a.label.toLowerCase()}`}
          data-label={`Tapped ${a.label}`}
          className={tile}
        >
          <Icon name={a.icon} className="h-[18px] w-[18px] text-scarlet-bright" />
          {a.label}
        </a>
      ))}
      <button type="button" onClick={share} data-track="share-card" data-label="Shared card link" className={tile}>
        <Icon name="share" className="h-[18px] w-[18px] text-scarlet-bright" />
        {copied ? "Copied" : "Share"}
      </button>
    </div>
  );
}

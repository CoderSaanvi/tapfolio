"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buildVCard } from "@/lib/vcard";
import type { Profile } from "@/lib/types";

interface SaveContactButtonProps {
  profile: Profile;
}

export function SaveContactButton({ profile }: SaveContactButtonProps) {
  const [error, setError] = useState(false);

  function save() {
    try {
      const url = `${window.location.origin}/c/${profile.slug}`;
      const blob = new Blob([buildVCard(profile, url)], { type: "text/vcard" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${profile.firstName}-${profile.lastName}.vcf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      setError(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={save}
        data-track="save-contact"
        data-label="Saved contact"
        className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-b from-scarlet to-scarlet-deep px-4 py-4 text-[15px] font-semibold text-white shadow-save transition hover:brightness-105 active:scale-[.99]"
      >
        <Icon name="save" />
        <span>Save my contact</span>
      </button>
      {error && <p className="mt-2 text-center text-xs text-ink-2">Couldn&apos;t save here. Use Call or Email below.</p>}
    </>
  );
}

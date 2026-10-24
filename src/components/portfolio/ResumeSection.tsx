"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrackedSection } from "@/components/tracking/TrackedSection";
import type { Profile } from "@/lib/types";

interface ResumeSectionProps {
  profile: Profile;
}

export function ResumeSection({ profile: p }: ResumeSectionProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <TrackedSection id="resume" label="Resume">
      <SectionHeading title="Resume" />
      <div className="grid items-center gap-9 md:grid-cols-[300px_1fr]">
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-track="resume:open"
          data-label="Opened resume full size"
          aria-label="View resume full size"
          className="block w-full max-w-[260px] cursor-zoom-in overflow-hidden rounded-lg border border-line bg-white shadow-[0_18px_40px_-20px_rgba(33,35,37,.35)] transition hover:-translate-y-1 md:max-w-none"
        >
          <Image src={p.resume.image} alt={`${p.fullName}'s one-page resume`} width={1105} height={1430} sizes="300px" className="block h-auto w-full" />
        </button>
        <div>
          <h3 className="font-display text-[32px] font-extrabold">The one-page version</h3>
          <p className="mt-2.5 max-w-[34em]">Education, experience, leadership, research, and skills on a single page.</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button type="button" onClick={() => setOpen(true)} data-track="resume:open" data-label="Opened resume full size" className="rounded-[10px] bg-gradient-to-b from-scarlet to-scarlet-deep px-[18px] py-[11px] font-semibold text-white">
              View resume
            </button>
            <a href={p.resume.pdf} target="_blank" rel="noopener" data-track="resume:pdf" data-label="Downloaded resume PDF" className="rounded-[10px] border-[1.5px] border-scarlet px-[18px] py-[10px] font-semibold text-scarlet no-underline">
              Download PDF
            </a>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-ink/70 p-4" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Resume" className="flex max-h-full w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-line-soft px-3.5 py-2.5 font-sys text-sm">
              <b>Resume · {p.fullName}</b>
              <button type="button" autoFocus onClick={() => setOpen(false)} className="rounded-[10px] bg-scarlet px-3 py-1.5 text-sm font-semibold text-white">
                Close
              </button>
            </div>
            <div className="overflow-auto">
              <Image src={p.resume.image} alt={`${p.fullName}'s resume, full size`} width={1105} height={1430} sizes="900px" loading="eager" className="block h-auto w-full" />
            </div>
          </div>
        </div>
      )}
    </TrackedSection>
  );
}

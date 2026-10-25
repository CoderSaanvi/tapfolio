"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TrackedSection } from "@/components/tracking/TrackedSection";

export function ResumeSection({ profile: p }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <TrackedSection id="resume" label="Resume">
      <SectionTitle title="Resume" />
      <div className="flex items-center gap-5 rounded-2xl border border-line bg-card p-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-track="resume:open"
          data-label="Opened resume full size"
          aria-label="View resume full size"
          className="w-24 flex-none overflow-hidden rounded-lg border border-line bg-white sm:w-32"
        >
          {p.resume.image ? (
            <Image src={p.resume.image} alt={`${p.fullName}'s one-page resume`} width={1105} height={1430} sizes="128px" className="block h-auto w-full" />
          ) : (
            <span className="grid aspect-[8.5/11] place-items-center font-mono text-xs font-medium text-scarlet">PDF</span>
          )}
        </button>
        <div className="min-w-0">
          <p className="font-medium">The one-page version</p>
          <p className="mt-1 text-sm text-ink-2">Education, experience, research, and skills.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              data-track="resume:open"
              data-label="Opened resume full size"
              className="rounded-xl bg-scarlet px-4 py-2 text-sm font-semibold text-white"
            >
              View
            </button>
            <a
              href={p.resume.pdf}
              target="_blank"
              rel="noopener"
              data-track="resume:pdf"
              data-label="Downloaded resume PDF"
              className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-ink no-underline"
            >
              PDF ↗
            </a>
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[65] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Resume"
            className="flex max-h-[92dvh] w-full max-w-[900px] flex-col overflow-hidden rounded-t-[24px] border border-line bg-card sm:rounded-2xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3 text-sm">
              <b className="font-medium">Resume · {p.fullName}</b>
              <button type="button" autoFocus onClick={() => setOpen(false)} className="rounded-full bg-wash px-3.5 py-1.5 text-sm font-semibold">
                Done
              </button>
            </div>
            <div className="overflow-auto bg-white pb-[env(safe-area-inset-bottom)]">
              {p.resume.image ? (
                <Image
                  src={p.resume.image}
                  alt={`${p.fullName}'s resume, full size`}
                  width={1105}
                  height={1430}
                  sizes="900px"
                  loading="eager"
                  className="block h-auto w-full"
                />
              ) : (
                <iframe src={p.resume.pdf} title={`${p.fullName}'s resume`} className="block h-[80dvh] w-full" />
              )}
            </div>
          </div>
        </div>
      )}
    </TrackedSection>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import { Icon } from "@/components/ui/Icon";

interface UploadStepProps {
  photo: File | null;
  resume: File | null;
  onPhoto: (f: File) => void;
  onResume: (f: File) => void;
}

export function UploadStep({ photo, resume, onPhoto, onResume }: UploadStepProps) {
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  return (
    <>
      <label className="flex cursor-pointer flex-col items-center gap-3 rounded-3xl border border-line bg-card px-5 py-7">
        <span className="relative grid h-36 w-36 place-items-center overflow-hidden rounded-full border-2 border-dashed border-line bg-wash">
          {preview ? (
            // Object URL preview; next/image can't optimize blob URLs.
            <img src={preview} alt="Your photo" className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl text-ink-2">＋</span>
          )}
        </span>
        <span className="font-medium">{photo ? "Change photo" : "Add your photo"}</span>
        <span className="text-xs text-ink-2">A clear headshot works best</span>
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])} />
      </label>

      <label className="flex cursor-pointer items-center gap-4 rounded-3xl border border-line bg-card p-5">
        <span className={`grid h-12 w-12 flex-none place-items-center rounded-xl ${resume ? "bg-emerald-400/15 text-emerald-400" : "bg-scarlet-tint text-scarlet-bright"}`}>
          <Icon name="doc" className="h-6 w-6" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="font-medium">{resume ? "Resume added" : "Upload your resume"}</span>
          <span className="truncate text-xs text-ink-2">{resume ? resume.name : "PDF, from Files or iCloud Drive"}</span>
        </span>
        <Icon name="chevron" className="h-4 w-4 text-ink-2" />
        <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && onResume(e.target.files[0])} />
      </label>
    </>
  );
}

import Image from "next/image";
import { LogoTile, schoolLogo } from "@/components/ui/LogoTile";
import { ExploreLinks } from "./ExploreLinks";
import { QuickActions } from "./QuickActions";
import { SaveContactButton } from "./SaveContactButton";
import type { Profile } from "@/lib/types";

interface BusinessCardProps {
  profile: Profile;
}

/** The first thing a recruiter sees after the tap: who you are, save/contact, and links to everything. */
export function BusinessCard({ profile: p }: BusinessCardProps) {
  return (
    <div id="card" className="relative w-full overflow-hidden rounded-[28px] border border-line border-t-[3px] border-t-scarlet bg-card shadow-card">
      <div className="relative aspect-[5/4] overflow-hidden">
        <Image src={p.photo} alt={p.fullName} fill priority sizes="(max-width: 1024px) 100vw, 420px" className="object-cover object-[50%_30%]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-card" />
        {p.location && <span className="absolute left-4 top-[max(16px,env(safe-area-inset-top))] rounded-full border border-white/15 bg-black/40 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[.18em] text-white/90 backdrop-blur">
          {p.location}
        </span>}
      </div>

      <div className="relative -mt-14 flex flex-col gap-5 px-5 pb-5">
        <div>
          <h1 className="font-sora text-[34px] font-semibold leading-[1.05] tracking-tight">
            {p.firstName} {p.lastName}
          </h1>
          <p className="mt-1.5 text-sm text-ink-2">{p.headline}</p>
        </div>

        <div className="flex items-center gap-3">
          <LogoTile {...schoolLogo(p.school.name)} size="sm" />
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-[15px] text-ink [font-variant:small-caps]">{p.school.name}</span>
            <span className="text-[11px] uppercase tracking-[.08em] text-ink-2">
              {p.school.unit} · {p.school.year}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <SaveContactButton profile={p} />
          <QuickActions profile={p} />
        </div>

        <ExploreLinks profile={p} />
        <p className="text-center text-[11px] tracking-wide text-ink-2">{p.tagline}</p>
      </div>
    </div>
  );
}

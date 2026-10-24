import Image from "next/image";
import { Icon } from "@/components/ui/Icon";
import { PlaceLinks } from "./PlaceLinks";
import { QuickActions } from "./QuickActions";
import { SaveContactButton } from "./SaveContactButton";
import { ShareLinkButton } from "./ShareLinkButton";
import type { Profile } from "@/lib/types";

interface BusinessCardProps {
  profile: Profile;
}

export function BusinessCard({ profile: p }: BusinessCardProps) {
  return (
    <div className="relative w-full max-w-[420px] overflow-hidden rounded-3xl border border-line border-t-4 border-t-scarlet bg-white px-[26px] pb-[26px] font-sys shadow-card">
      <div className="relative -mx-[26px] mb-5 aspect-[4/5] overflow-hidden bg-white">
        <Image src={p.photo} alt={p.fullName} fill priority sizes="420px" className="object-cover object-[50%_25%]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-b from-transparent from-70% to-white" />
      </div>

      <p className="mb-[18px] text-center text-[11px] uppercase tracking-[.32em] text-ink-2">{p.location} · Let&apos;s connect</p>
      <h1 className="mb-2.5 text-center text-4xl font-bold leading-[1.06] tracking-[-.02em] text-ink">
        {p.firstName} {p.lastName}
      </h1>
      <p className="mx-auto mb-6 max-w-[34ch] text-center text-[13.5px] leading-normal text-ink-2">
        <b className="font-semibold text-ink">{p.title}</b>
        <br />
        {p.focus}
      </p>

      <div className="-mt-2 mb-[22px] flex justify-center">
        <div className="flex flex-col text-left text-[#666]">
          <span className="border-b border-current pb-1 font-serif text-lg leading-tight tracking-[.02em] [font-variant:small-caps]">
            {p.school.name}
          </span>
          <span className="pt-1 text-[10.5px] uppercase tracking-[.06em]">
            {p.school.unit} · {p.school.year}
          </span>
        </div>
      </div>

      <SaveContactButton profile={p} />
      <a
        href={p.contact.linkedin}
        target="_blank"
        rel="noopener"
        data-track="cta:linkedin"
        data-label="Opened LinkedIn (main button)"
        className="mt-2 flex items-center justify-center gap-2.5 rounded-2xl border-[1.5px] border-scarlet px-4 py-3.5 text-[14.5px] font-semibold text-scarlet no-underline hover:bg-scarlet/5"
      >
        <Icon name="linkedin" />
        <span>Let&apos;s Connect on LinkedIn!</span>
      </a>
      <div className="mt-2">
        <ShareLinkButton title={`${p.firstName} ${p.lastName}`} path={`/c/${p.slug}`} />
      </div>
      <QuickActions contact={p.contact} />

      <div className="my-[14px] mt-6 flex items-center gap-3 text-[10.5px] uppercase tracking-[.26em] text-ink-2 opacity-70 before:h-px before:flex-1 before:bg-line-soft after:h-px after:flex-1 after:bg-line-soft">
        Find me
      </div>
      <PlaceLinks places={p.places} />
      <footer className="mt-6 text-center text-[11px] tracking-wide text-ink-2">{p.tagline}</footer>
    </div>
  );
}

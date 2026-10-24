import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrackedSection } from "@/components/tracking/TrackedSection";
import type { Profile } from "@/lib/types";

interface AcademicsSectionProps {
  profile: Profile;
}

export function AcademicsSection({ profile: p }: AcademicsSectionProps) {
  return (
    <TrackedSection id="academics" label="Academics">
      <SectionHeading title="Academics" />
      <div className="grid gap-7 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-line border-t-4 border-t-scarlet bg-white p-[26px]">
          <p className="eyebrow">{p.degree.label}</p>
          <h3 className="font-display text-[32px] font-extrabold leading-none">{p.degree.major}</h3>
          <p className="mt-1 text-ink-2">{p.degree.minor}</p>
          {p.degree.about.map((t) => (
            <p key={t.slice(0, 24)} className="mt-4">
              {t}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-2 content-start gap-3">
          {p.facts.map((f) => (
            <div key={f.label} className={`rounded-xl border border-line bg-white p-[18px] ${f.wide ? "col-span-2" : ""}`}>
              <b className={`block font-display font-extrabold leading-none text-scarlet tabular-nums ${f.wide ? "text-[28px]" : "text-[40px]"}`}>
                {f.value}
              </b>
              <span className="text-sm text-ink-2">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </TrackedSection>
  );
}

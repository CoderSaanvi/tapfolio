import { LogoTile, schoolLogo } from "@/components/ui/LogoTile";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TrackedSection } from "@/components/tracking/TrackedSection";
import type { Profile } from "@/lib/types";

interface EducationSectionProps {
  profile: Profile;
}

export function EducationSection({ profile: p }: EducationSectionProps) {
  return (
    <TrackedSection id="education" label="Education">
      <SectionTitle title="Education" />
      <div className="rounded-2xl border border-line border-t-[3px] border-t-scarlet bg-card p-5">
        <div className="flex items-center gap-4">
          <LogoTile {...schoolLogo(p.school.name)} />
          <div className="leading-snug">
            <p className="font-serif text-lg [font-variant:small-caps]">{p.school.name}</p>
            <p className="text-sm text-ink-2">{[p.degree.major, p.degree.minor.split(" · ")[0]].filter(Boolean).join(" · ")}</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {p.facts.map((f) => (
            <div key={f.label} className={`rounded-xl bg-wash px-4 py-3 ${f.wide ? "col-span-2 sm:col-span-1" : ""}`}>
              <b className={`block font-sora font-semibold text-scarlet-bright ${f.wide ? "text-lg" : "text-2xl"}`}>{f.value}</b>
              <span className="text-xs text-ink-2">{f.wide ? "OSU scholarship for academic excellence" : f.label}</span>
            </div>
          ))}
        </div>
        {p.degree.about.map((t) => (
          <p key={t.slice(0, 24)} className="mt-4 text-[14.5px] leading-relaxed text-ink/85">{t}</p>
        ))}
      </div>
    </TrackedSection>
  );
}

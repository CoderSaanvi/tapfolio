import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrackedSection } from "@/components/tracking/TrackedSection";
import type { Profile } from "@/lib/types";

interface SkillsSectionProps {
  skills: Profile["skills"];
}

export function SkillsSection({ skills }: SkillsSectionProps) {
  return (
    <TrackedSection id="skills" label="Skills">
      <SectionHeading title="Skills" />
      <div className="grid gap-4 md:grid-cols-2">
        {skills.map((s) => (
          <div key={s.name} className="min-w-0 rounded-xl border border-line bg-white p-5">
            <h3 className="mb-2.5 font-display text-[22px] font-bold">{s.name}</h3>
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {s.items.map((i) => (
                <li key={i} className="rounded-full border border-line-soft bg-wash px-2.5 py-1 text-sm">
                  {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </TrackedSection>
  );
}

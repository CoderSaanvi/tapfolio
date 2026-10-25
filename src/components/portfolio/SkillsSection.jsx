import { SectionTitle } from "@/components/ui/SectionTitle";
import { TrackedSection } from "@/components/tracking/TrackedSection";

export function SkillsSection({ skills }) {
  return (
    <TrackedSection id="skills" label="Skills">
      <SectionTitle title="Skills" />
      <div className="grid gap-3 sm:grid-cols-2">
        {skills.map((s) => (
          <div key={s.name} className="min-w-0 rounded-2xl border border-line bg-card p-4">
            <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[.14em] text-scarlet-bright">{s.name}</h3>
            <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
              {s.items.map((i) => (
                <li key={i} className="rounded-full border border-line bg-wash px-2.5 py-1 text-[13px] text-ink/90">
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

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessCard } from "@/components/card/BusinessCard";
import { AcademicsSection } from "@/components/portfolio/AcademicsSection";
import { LiveFeed } from "@/components/portfolio/LiveFeed";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { ResumeSection } from "@/components/portfolio/ResumeSection";
import { SkillsSection } from "@/components/portfolio/SkillsSection";
import { Timeline } from "@/components/portfolio/Timeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TrackedSection } from "@/components/tracking/TrackedSection";
import { ViewTracker } from "@/components/tracking/ViewTracker";
import { getProfile } from "@/data/profile";

interface CardPageProps {
  params: { slug: string };
}

export function generateMetadata({ params }: CardPageProps): Metadata {
  const p = getProfile(params.slug);
  if (!p) return { title: "Card not found" };
  return { title: `${p.firstName} ${p.lastName}`, description: `${p.title} · ${p.focus}`, openGraph: { images: [p.photo] } };
}

export default function CardPage({ params }: CardPageProps) {
  const p = getProfile(params.slug);
  if (!p) notFound();

  return (
    <>
      <ViewTracker slug={p.slug} />
      <div className="sticky top-0 z-10 bg-scarlet pt-[env(safe-area-inset-top)] text-white">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-5 py-3">
          <div className="flex flex-col leading-tight">
            <b className="font-serif text-xl font-normal tracking-[.03em] [font-variant:small-caps]">{p.school.name}</b>
            <span className="text-xs uppercase tracking-[.06em] opacity-90">College of Engineering · Biomedical Engineering</span>
          </div>
        </div>
      </div>
      <div className="osu-stripe" aria-hidden="true" />

      <main className="mx-auto grid max-w-[1180px] gap-10 px-4 py-8 lg:grid-cols-[420px_minmax(0,1fr)] lg:px-5">
        <aside className="flex justify-center lg:sticky lg:top-24 lg:self-start">
          <BusinessCard profile={p} />
        </aside>

        <div className="flex min-w-0 flex-col gap-16">
          <section className="flex flex-col gap-5">
            <p className="max-w-[36em] text-[19px]">{p.bio}</p>
            <LiveFeed githubUser={p.contact.githubUser} />
          </section>

          <section>
            <SectionHeading title="Projects" sub="Things I've designed and built for companies, clinicians, nonprofits, and my own teams." />
            <div className="grid gap-[22px] md:grid-cols-2">
              {p.projects.map((proj) => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          </section>

          <AcademicsSection profile={p} />
          <ResumeSection profile={p} />

          <TrackedSection id="experience" label="Experience">
            <SectionHeading title="Experience" />
            <div className="grid gap-11 xl:grid-cols-2">
              <Timeline label="Work & research" items={p.experience.work} />
              <Timeline label="Leadership & activities" items={p.experience.leadership} />
            </div>
          </TrackedSection>

          <SkillsSection skills={p.skills} />
        </div>
      </main>

      <footer className="bg-ink py-[18px] text-sm text-[#d4d7d9]">
        <div className="mx-auto max-w-[1180px] px-5">
          {p.fullName} · Biomedical Engineering, {p.school.name}
        </div>
      </footer>
    </>
  );
}

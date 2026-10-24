import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessCard } from "@/components/card/BusinessCard";
import { BackToCard } from "@/components/portfolio/BackToCard";
import { EducationSection } from "@/components/portfolio/EducationSection";
import { ExperienceSection } from "@/components/portfolio/ExperienceSection";
import { Intro } from "@/components/portfolio/Intro";
import { ProjectGrid } from "@/components/portfolio/ProjectGrid";
import { ResumeSection } from "@/components/portfolio/ResumeSection";
import { SiteNav } from "@/components/portfolio/SiteNav";
import { SkillsSection } from "@/components/portfolio/SkillsSection";
import { ViewTracker } from "@/components/tracking/ViewTracker";
import { getProfile } from "@/lib/profiles";

export const dynamic = "force-dynamic";

interface CardPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CardPageProps): Promise<Metadata> {
  const p = await getProfile(params.slug);
  if (!p) return { title: "Card not found" };
  return { title: `${p.firstName} ${p.lastName}`, description: `${p.title} · ${p.focus}`, openGraph: { images: [p.photo] } };
}

/** What the recruiter's phone opens after the tap: the contact card first, the portfolio behind it. */
export default async function CardPage({ params }: CardPageProps) {
  const p = await getProfile(params.slug);
  if (!p) notFound();

  return (
    <>
      <ViewTracker slug={p.slug} />
      <SiteNav initials={`${p.firstName[0]}${p.lastName[0]}`} />

      <main className="mx-auto grid max-w-[1120px] grid-cols-[minmax(0,1fr)] gap-12 px-4 pb-28 pt-4 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-14 lg:px-6 lg:pt-10">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <BusinessCard profile={p} />
        </aside>

        <div className="flex min-w-0 flex-col gap-16">
          <Intro profile={p} />
          <ExperienceSection experience={p.experience} />
          <ProjectGrid projects={p.projects} />
          <ResumeSection profile={p} />
          <EducationSection profile={p} />
          <SkillsSection skills={p.skills} />
        </div>
      </main>

      <footer className="border-t border-line-soft pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-ink-2 lg:px-6">
          <span className="flex items-center gap-4">
            <span className="font-sora text-xl font-light text-scarlet-bright">{p.firstName[0]}{p.lastName[0]}</span>© 2026
          </span>
          <span className="flex gap-5">
            <a href={p.contact.linkedin} target="_blank" rel="noopener" className="no-underline hover:text-ink">LinkedIn</a>
            <a href={p.contact.github} target="_blank" rel="noopener" className="no-underline hover:text-ink">GitHub</a>
            <a href={`mailto:${p.contact.email}`} className="no-underline hover:text-ink">Email</a>
          </span>
        </div>
      </footer>
      <BackToCard />
    </>
  );
}

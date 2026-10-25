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
  searchParams?: { for?: string };
}

/** The owner picks who they're AirDropping to; the page leads with what that person wants. */
function audienceNote(audience: string | undefined, p: { firstName: string; contact: { linkedin: string; github: string; email: string } }) {
  if (audience === "recruiter") {
    return {
      text: `Hiring? ${p.firstName}'s resume and contact are right on the card above.`,
      links: [{ label: "Email", href: `mailto:${p.contact.email}` }, { label: "LinkedIn", href: p.contact.linkedin }],
    };
  }
  if (audience === "student") {
    return {
      text: `Hey! Let's stay connected: ${p.firstName}'s projects are below.`,
      links: [{ label: "LinkedIn", href: p.contact.linkedin }, ...(p.contact.github ? [{ label: "GitHub", href: p.contact.github }] : [])],
    };
  }
  return undefined;
}

export async function generateMetadata({ params }: CardPageProps): Promise<Metadata> {
  const p = await getProfile(params.slug);
  if (!p) return { title: "Card not found" };
  return { title: `${p.firstName} ${p.lastName}`, description: `${p.title} · ${p.focus}`, openGraph: { images: [p.photo] } };
}

/** What the recruiter's phone opens after the tap: the contact card first, the portfolio behind it. */
export default async function CardPage({ params, searchParams }: CardPageProps) {
  const p = await getProfile(params.slug);
  if (!p) notFound();
  const audience = searchParams?.for;
  const note = audienceNote(audience, p);
  // Recruiters get the resume right after the intro; students get projects first.
  const sections =
    audience === "student"
      ? [<ProjectGrid key="projects" projects={p.projects} />, <ExperienceSection key="work" experience={p.experience} />, <SkillsSection key="skills" skills={p.skills} />, <EducationSection key="edu" profile={p} />, <ResumeSection key="resume" profile={p} />]
      : audience === "recruiter"
        ? [<ExperienceSection key="work" experience={p.experience} />, <ResumeSection key="resume" profile={p} />, <ProjectGrid key="projects" projects={p.projects} />, <EducationSection key="edu" profile={p} />, <SkillsSection key="skills" skills={p.skills} />]
        : [<ExperienceSection key="work" experience={p.experience} />, <ProjectGrid key="projects" projects={p.projects} />, <ResumeSection key="resume" profile={p} />, <EducationSection key="edu" profile={p} />, <SkillsSection key="skills" skills={p.skills} />];

  return (
    <>
      <ViewTracker slug={p.slug} />
      <SiteNav initials={`${p.firstName[0]}${p.lastName[0]}`} />

      {note && (
        <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-2 px-4 pt-4 lg:px-6">
          <p className="m-0 rounded-2xl border border-line bg-card px-4 py-2.5 text-sm text-ink">
            {note.text}
            {note.links.map((l) => (
              <a key={l.label} href={l.href} target={l.href.startsWith("http") ? "_blank" : undefined} rel="noopener" data-track={`audience:${l.label.toLowerCase()}`} data-label={`Tapped ${l.label} (${audience})`} className="ml-3 font-semibold text-scarlet-bright no-underline">
                {l.label} →
              </a>
            ))}
          </p>
        </div>
      )}

      <main className="mx-auto grid max-w-[1120px] grid-cols-[minmax(0,1fr)] gap-12 px-4 pb-28 pt-4 lg:grid-cols-[400px_minmax(0,1fr)] lg:gap-14 lg:px-6 lg:pt-10">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <BusinessCard profile={p} />
        </aside>

        <div className="flex min-w-0 flex-col gap-16">
          <Intro profile={p} />
          {sections}
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

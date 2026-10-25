import type { OnboardingAnswers, ProfileDraft } from "./profile-schema";
import type { ExperienceItem, Place, Profile, Project } from "./types";

const OSU = /ohio state|\bosu\b|wexner|buckeye/i;
const OSU_LOGO = "/osu-logo.svg";

const clean = (s: string | undefined) => (s ?? "").trim();
const orUndefined = (s: string) => (clean(s) ? clean(s) : undefined);

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "project";
}

function initials(org: string): string {
  const words = org.split(" · ")[0].replace(/[^A-Za-z0-9 ]/g, " ").split(/\s+/).filter((w) => w && w[0] === w[0].toUpperCase());
  return (words.length ? words : [org]).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "•";
}

function phoneE164(raw: string): string {
  const d = raw.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  return d ? `+${d}` : "";
}

/** Accepts a full URL, "linkedin.com/in/you", or just "you". */
function url(raw: string, domain: string, prefix: string): string {
  const v = clean(raw).replace(/^@/, "");
  if (!v) return "";
  if (/^https?:\/\//.test(v)) return v;
  if (v.includes(domain)) return `https://${v.replace(/^\/+/, "")}`;
  return `https://${prefix}/${v}`;
}

function experience(items: ProfileDraft["experience"]["work"], school: string): ExperienceItem[] {
  return items
    .filter((e) => clean(e.title))
    .map((e) => ({
      when: clean(e.when),
      title: clean(e.title),
      org: clean(e.org),
      context: orUndefined(e.context),
      bullets: e.bullets.map(clean).filter(Boolean),
      badge: orUndefined(e.badge),
      ...((OSU.test(e.org) || (e.atSchool && OSU.test(school))) ? { logo: OSU_LOGO } : { mark: initials(e.org) }),
    }));
}

/** Turns Claude's draft plus the user's own answers (which win) into a full Profile. */
export function profileFromDraft(d: ProfileDraft, a: OnboardingAnswers, files: { slug: string; photo: string; resumePdf: string }): Profile {
  const seen = new Set<string>();
  const projects: Project[] = d.projects
    .filter((p) => clean(p.title))
    .map((p) => {
      let id = slugify(p.title);
      while (seen.has(id)) id += "-x";
      seen.add(id);
      return {
        id,
        label: clean(p.label),
        title: clean(p.title),
        where: clean(p.where),
        blurb: orUndefined(p.blurb),
        summary: p.summary.map(clean).filter(Boolean),
        tags: p.tags.map(clean).filter(Boolean).slice(0, 6),
        metrics: p.metrics.length ? p.metrics : undefined,
        status: p.isCurrent ? "Current project" : undefined,
      };
    });
  projects.forEach((p, i) => (p.feature = i === 0));

  // The name they typed wins over the resume's: first word is the first name, the rest the last.
  const [shownFirst, ...shownRest] = clean(a.displayName).split(/\s+/).filter(Boolean);
  const firstName = shownFirst ?? clean(d.firstName);
  const lastName = shownFirst ? shownRest.join(" ") : clean(d.lastName);

  const linkedin = url(a.linkedin || d.contact.linkedin, "linkedin.com", "www.linkedin.com/in");
  const github = url(a.github || d.contact.github, "github.com", "github.com");
  const places: Place[] = github ? [{ name: "GitHub", sub: github.replace("https://", ""), href: github, icon: "code" }] : [];

  return {
    slug: files.slug,
    firstName,
    lastName,
    fullName: clean(d.fullName) || `${firstName} ${lastName}`,
    pronouns: orUndefined(a.pronouns),
    location: clean(d.location),
    title: clean(d.title),
    headline: clean(d.headline),
    focus: clean(d.focus),
    bio: clean(d.bio),
    tagline: clean(a.tagline) || clean(d.tagline),
    photo: files.photo,
    school: d.school,
    degree: { ...d.degree, about: d.degree.about.map(clean).filter(Boolean) },
    facts: d.facts.filter((f) => clean(f.value)).slice(0, 4),
    contact: {
      phone: phoneE164(a.phone || d.contact.phone),
      email: clean(a.email) || clean(d.contact.email),
      linkedin,
      github,
      githubUser: github.split("github.com/")[1]?.split("/")[0] ?? "",
    },
    places,
    projects,
    experience: { work: experience(d.experience.work, d.school.name), leadership: experience(d.experience.leadership, d.school.name) },
    skills: d.skills.filter((s) => s.items.length),
    resume: { pdf: files.resumePdf },
  };
}

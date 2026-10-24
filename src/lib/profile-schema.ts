import { z } from "zod";

/** What Claude returns when building a portfolio from a resume. Empty string / [] means "not on the resume". */
const Experience = z.object({
  when: z.string().describe("Dates as written on the resume, e.g. 'May 2026 – Present'"),
  title: z.string(),
  org: z.string().describe("Organization, optionally ' · City, ST'"),
  context: z.string().describe("One sentence on what the organization is, or empty"),
  bullets: z.array(z.string()).describe("2-4 concise accomplishment bullets from the resume"),
  badge: z.string().describe("Award/placement to highlight, or empty"),
  atSchool: z.boolean().describe("True if this is a club, lab, team, or job at their own university"),
});

export const ProfileDraftSchema = z.object({
  firstName: z.string().describe("Preferred first name"),
  lastName: z.string(),
  fullName: z.string(),
  location: z.string().describe("City, ST"),
  title: z.string().describe("e.g. 'Biomedical Engineering Student'"),
  headline: z.string().describe("e.g. 'Computer Science + Business @ Ohio State University'"),
  focus: z.string().describe("2-3 focus areas joined by ' · '"),
  bio: z.string().describe("2-3 first-person sentences aimed at the roles they want"),
  tagline: z.string().describe("Short sign-off line for the bottom of the card"),
  school: z.object({ name: z.string(), unit: z.string().describe("College/school within the university"), year: z.string().describe("Class standing, e.g. 'Junior'") }),
  degree: z.object({
    label: z.string().describe("e.g. 'B.S. Engineering · The Ohio State University'"),
    major: z.string(),
    minor: z.string().describe("e.g. 'Minor in Business', or empty"),
    about: z.array(z.string()).describe("1-2 short first-person paragraphs about their studies and interests"),
  }),
  facts: z
    .array(z.object({ value: z.string(), label: z.string(), wide: z.boolean() }))
    .describe("Up to 4: GPA and test scores (value '3.8', label 'GPA'), then the single most notable honor or scholarship as wide (value = honor name, label = under 6 words). Awards for specific projects belong in those projects' badges or metrics, not here."),
  contact: z.object({ email: z.string(), phone: z.string(), linkedin: z.string(), github: z.string() }),
  projects: z
    .array(
      z.object({
        title: z.string(),
        label: z.string().describe("Category, e.g. 'Research', 'Client project', 'Personal product'"),
        where: z.string().describe("Role · organization or context"),
        blurb: z.string().describe("One line, under 90 characters"),
        summary: z.array(z.string()).describe("1-2 paragraphs describing the project"),
        tags: z.array(z.string()).describe("3-5 technologies or skills"),
        metrics: z.array(z.object({ value: z.string(), label: z.string() })).describe("Only numbers stated on the resume"),
        isCurrent: z.boolean().describe("True for what they are building right now"),
      }),
    )
    .describe("4-8 projects, strongest first"),
  experience: z.object({
    work: z.array(Experience).describe("Jobs, internships, research"),
    leadership: z.array(Experience).describe("Leadership, clubs, teams, activities"),
  }),
  skills: z.array(z.object({ name: z.string(), items: z.array(z.string()) })).describe("2-4 groups, e.g. Technical, AI & ML, Languages"),
});

export type ProfileDraft = z.infer<typeof ProfileDraftSchema>;

export interface OnboardingAnswers {
  displayName: string;
  pronouns: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  targetRoles: string;
  building: string;
  tagline: string;
}

/** The subset of the web app's types the mobile app reads. Kept in sync with tapfolio/src/lib/types.ts. */

export interface ProjectMedia {
  id: string;
  kind: "video" | "image";
  src: string;
}

export interface Project {
  id: string;
  title: string;
  where: string;
  blurb?: string;
  status?: string;
  links?: { label: string; href: string }[];
  media?: ProjectMedia[];
}

export interface Profile {
  slug: string;
  firstName: string;
  lastName: string;
  title: string;
  headline: string;
  photo: string;
  projects: Project[];
}

export interface RecruiterInfo {
  name: string;
  email: string;
  company: string;
  role: string;
}

export interface FollowUp {
  subject: string;
  body: string;
  sendOn: string;
  highlights: string[];
  source: "ai" | "template";
  status: "draft" | "sent";
}

export interface Conversation {
  id: string;
  slug: string;
  eventName: string;
  startedAt: string;
  endedAt?: string;
  transcript: string;
  notes: string;
  recruiter: RecruiterInfo;
  followUp?: FollowUp;
}

export interface ViewSession {
  sessionId: string;
  device: string;
  openedVia: string;
  startedAt: string;
  totalMs: number;
  sections: { target: string; label: string; ms: number }[];
  clicks: { label: string; at: string }[];
}

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

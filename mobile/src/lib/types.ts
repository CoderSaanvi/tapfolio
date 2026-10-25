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
  contact?: { phone: string; email: string; linkedin: string; github: string };
  school?: { name: string; unit: string; year: string };
  banner?: { text: string; logo?: string };
}

export type Audience = "recruiter" | "student";

export interface InsightItem {
  target: string;
  label: string;
  ms: number;
  sessions: number;
}

export interface Insights {
  views: number;
  viewers: number;
  totalMs: number;
  avgMs: number;
  topProjects: InsightItem[];
  topSections: InsightItem[];
  topClicks: { target: string; label: string; count: number }[];
  openedVia: { label: string; count: number }[];
  audience: { recruiter: number; student: number; unknown: number };
  leftInfo?: number;
  lastViewedAt?: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  email: string;
  events: string[];
  firstMetAt: string;
  lastMetAt: string;
  conversationIds: string[];
  latestConversationId?: string;
  source: "conversation" | "visitor" | "both";
  followUp?: { status: "draft" | "sent"; sendOn: string };
  notes: string;
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

export interface Metric {
  value: string;
  label: string;
}

export interface LinkItem {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  label: string;
  title: string;
  where: string;
  summary: string[];
  tags: string[];
  metrics?: Metric[];
  links?: LinkItem[];
  note?: string;
  status?: string;
  /** One short line for compact spots (Currently card, collapsed tiles). */
  blurb?: string;
  feature?: boolean;
  image?: { src: string; alt: string; position?: string };
  org?: { name: string; accent?: string; place: string };
}

export interface ExperienceItem {
  when: string;
  title: string;
  org: string;
  context?: string;
  bullets: string[];
  badge?: string;
  /** Image in public/ for the logo tile, else `mark` initials are shown. */
  logo?: string;
  mark?: string;
}

export interface Fact {
  value: string;
  label: string;
  wide?: boolean;
}

export interface Place {
  name: string;
  sub: string;
  href: string;
  icon: "pin" | "globe" | "code";
}

export interface Profile {
  slug: string;
  firstName: string;
  lastName: string;
  fullName: string;
  location: string;
  title: string;
  headline: string;
  focus: string;
  bio: string;
  tagline: string;
  photo: string;
  school: { name: string; unit: string; year: string };
  degree: { label: string; major: string; minor: string; about: string[] };
  facts: Fact[];
  contact: { phone: string; email: string; linkedin: string; github: string; githubUser: string };
  places: Place[];
  projects: Project[];
  experience: { work: ExperienceItem[]; leadership: ExperienceItem[] };
  skills: { name: string; items: string[] }[];
  resume: { pdf: string; image: string };
}

export type EventType = "open" | "dwell" | "click";

export interface ViewEvent {
  id: string;
  sessionId: string;
  slug: string;
  type: EventType;
  target: string;
  label: string;
  ms?: number;
  eventName?: string;
  conversationId?: string;
  userAgent?: string;
  at: string;
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
  /** ISO date (YYYY-MM-DD) the email should go out. */
  sendOn: string;
  highlights: string[];
  source: "ai" | "template";
  status: "draft" | "sent";
  generatedAt: string;
  sentAt?: string;
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
  deletedAt?: string;
}

export interface Metric {
  value: string;
  label: string;
}

export interface LinkItem {
  label: string;
  href: string;
}

export interface ProjectMedia {
  id: string;
  kind: "video" | "image";
  src: string;
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
  /** Demo videos and photos the owner uploaded for this project. */
  media?: ProjectMedia[];
  org?: { name: string; accent?: string; place: string };
}

export interface ExperienceItem {
  when: string;
  title: string;
  org: string;
  context?: string;
  bullets: string[];
  /** Two sentences on what the role amounted to; shown in place of the bullets, which move behind "Details". */
  summary?: string;
  /** Numbers from this role's bullets, shown big and red like project metrics. */
  metrics?: Metric[];
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
  pronouns?: string;
  location: string;
  title: string;
  headline: string;
  focus: string;
  bio: string;
  tagline: string;
  photo: string;
  school: { name: string; unit: string; year: string };
  /** Strip across the top of the card. Defaults to the school; the owner can change the text or blank it to hide. */
  banner?: { text: string; logo?: string };
  degree: { label: string; major: string; minor: string; about: string[] };
  facts: Fact[];
  contact: { phone: string; email: string; linkedin: string; github: string; githubUser: string };
  places: Place[];
  projects: Project[];
  experience: { work: ExperienceItem[]; leadership: ExperienceItem[] };
  skills: { name: string; items: string[] }[];
  /** `image` is a rendered page for the thumbnail; built profiles only have the PDF. */
  resume: { pdf: string; image?: string };
}

export type EventType = "open" | "dwell" | "click";

/** Who the owner shared the card with; picked when AirDropping (`?for=`). */
export type Audience = "recruiter" | "student";

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
  audience?: Audience;
  userAgent?: string;
  at: string;
}

export interface InsightItem {
  target: string;
  label: string;
  /** Total time viewers spent here, across sessions. */
  ms: number;
  /** How many distinct viewers lingered here. */
  sessions: number;
}

/** What recruiters looked at most on one card, folded from the event log. */
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
  /** How many viewers filled in the "leave your info" form. */
  leftInfo?: number;
  lastViewedAt?: string;
}

/** Someone who scanned the card and left their details on it. */
export interface Visitor {
  id: string;
  slug: string;
  sessionId?: string;
  conversationId?: string;
  eventName?: string;
  audience?: Audience;
  name: string;
  email: string;
  company: string;
  role: string;
  note: string;
  userAgent?: string;
  at: string;
}

/** One person in the owner's network, folded from every conversation with them and anything they left on the card. */
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
  /** Where we know them from: a conversation the owner logged, their own form on the card, or both. */
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

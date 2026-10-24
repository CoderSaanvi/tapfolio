import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { formatDuration } from "./time";
import type { ViewSession } from "./sessions";
import type { Conversation, FollowUp, Profile, RecruiterInfo } from "./types";

const MODEL = "claude-opus-5-5";

const DraftSchema = z.object({
  recruiter: z.object({
    name: z.string().describe("Recruiter's full name if said in the conversation, else empty string"),
    company: z.string().describe("Their company, else empty string"),
    role: z.string().describe("Their job title, else empty string"),
    email: z.string().describe("Their email if spelled out, else empty string"),
  }),
  subject: z.string(),
  body: z.string().describe("Plain-text email body, no markdown"),
  sendAfterDays: z.number().describe("Days after the conversation to send: 1, 2 or 3"),
  highlights: z.array(z.string()).describe("2-4 short notes for the student on why the email says what it says"),
});

export interface FollowUpInput {
  profile: Profile;
  conversation: Conversation;
  sessions: ViewSession[];
  cardUrl: string;
}

export interface FollowUpResult {
  followUp: FollowUp;
  recruiter: Partial<RecruiterInfo>;
}

const SYSTEM = `You write follow-up emails from a college student to a recruiter they just met in person at a recruiting event.

During the conversation the student tapped phones with the recruiter to share a live portfolio card, and the student's phone recorded the conversation. You get the student's profile, a speech-to-text transcript (noisy, both speakers mixed, no speaker labels), the student's own notes, and what the recruiter looked at on the card afterwards.

How to write it:
- 90 to 150 words, warm and specific, in the student's voice. Plain text, no markdown.
- Open with one concrete thing from the conversation, so the recruiter instantly remembers who this is.
- Connect it to the one or two projects most relevant to what the recruiter cared about. Use the viewing activity to decide which projects to emphasize.
- The viewing activity is private to the student. Never mention or hint that the student knows what the recruiter viewed, clicked, or how long they spent.
- Only state facts that appear in the inputs. If the transcript is thin, keep the email short and general rather than inventing details.
- If they discussed a next step (apply to a role, send a resume, schedule a call), close on that. Otherwise end with one small, easy ask.
- Greet by first name if known, else "Hi there,". Sign off with the student's first name, then the portfolio link on its own line.`;

function activityText(sessions: ViewSession[]): string {
  if (sessions.length === 0) return "The recruiter has not opened the card yet.";
  return sessions
    .map((s, i) => {
      const sections = s.sections.map((sec) => `${sec.label} (${formatDuration(sec.ms)})`).join("; ") || "none";
      const clicks = s.clicks.map((c) => c.label).join("; ") || "none";
      return `Visit ${i + 1} on ${s.device}: time per section: ${sections}. Actions: ${clicks}.`;
    })
    .join("\n");
}

function profileText(p: Profile): string {
  const projects = p.projects.map((pr) => `- ${pr.title} (${pr.where}): ${pr.summary.join(" ")}`).join("\n");
  return `${p.fullName} (goes by ${p.firstName}), ${p.title} at ${p.school.name}. ${p.bio}\n\nProjects:\n${projects}`;
}

function sendDate(fromIso: string, days: number): string {
  const d = new Date(fromIso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Used when there's no API key, the call fails, or Claude declines. Keeps the app working. */
function templateDraft({ profile: p, conversation: c, sessions, cardUrl }: FollowUpInput): FollowUpResult {
  const top = sessions.flatMap((s) => s.sections).sort((a, b) => b.ms - a.ms)[0];
  const project = p.projects.find((pr) => top?.target === `project:${pr.id}`) ?? p.projects[0];
  const name = c.recruiter.name.split(" ")[0];
  const where = c.eventName ? ` at ${c.eventName}` : "";
  const body = `${name ? `Hi ${name},` : "Hi there,"}

Thank you for taking the time to talk with me${where}. I enjoyed our conversation and learning more about your team${c.recruiter.company ? ` at ${c.recruiter.company}` : ""}.

I wanted to share a bit more about ${project.title}, which I mentioned while we talked: ${project.summary[0]}

I'd love to stay in touch and hear about any roles that might be a fit. Please let me know if there's anything else I can send your way.

Best,
${p.firstName}
${cardUrl}`;
  return {
    recruiter: {},
    followUp: {
      subject: `Great meeting you${where}`,
      body,
      sendOn: sendDate(c.endedAt ?? c.startedAt, 2),
      highlights: ["Template draft: add a Claude API key for a draft tailored to the conversation."],
      source: "template",
      status: "draft",
      generatedAt: new Date().toISOString(),
    },
  };
}

export async function draftFollowUp(input: FollowUpInput): Promise<FollowUpResult> {
  const { profile, conversation: c, sessions, cardUrl } = input;
  try {
    const client = new Anthropic();
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium", format: betaZodOutputFormat(DraftSchema) },
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `<profile>\n${profileText(profile)}\n</profile>

<event>${c.eventName || "Unknown event"}, ${new Date(c.startedAt).toDateString()}</event>

<known_recruiter_details>${JSON.stringify(c.recruiter)}</known_recruiter_details>

<transcript>\n${c.transcript.trim() || "(no transcript recorded)"}\n</transcript>

<student_notes>\n${c.notes.trim() || "(none)"}\n</student_notes>

<recruiter_card_activity>\n${activityText(sessions)}\n</recruiter_card_activity>

<portfolio_link>${cardUrl}</portfolio_link>`,
        },
      ],
    });

    const draft = response.parsed_output;
    if (response.stop_reason === "refusal" || !draft) return templateDraft(input);

    const days = Math.min(3, Math.max(1, Math.round(draft.sendAfterDays)));
    const recruiter = Object.fromEntries(Object.entries(draft.recruiter).filter(([, v]) => v.trim() !== "")) as Partial<RecruiterInfo>;
    return {
      recruiter,
      followUp: {
        subject: draft.subject.trim(),
        body: draft.body.trim(),
        sendOn: sendDate(c.endedAt ?? c.startedAt, days),
        highlights: draft.highlights.slice(0, 4),
        source: "ai",
        status: "draft",
        generatedAt: new Date().toISOString(),
      },
    };
  } catch {
    // Missing key, network, rate limit, or a malformed response: fall back so the app keeps working.
    return templateDraft(input);
  }
}

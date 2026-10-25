import type { FollowUp } from "./types";

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** "Send Oct 26", "Due today", "Overdue since Oct 25", or "Sent" (same rules as the web app). */
export function dueLabel(f: FollowUp): string {
  if (f.status === "sent") return "Sent";
  const t = today();
  const pretty = new Date(`${f.sendOn}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (f.sendOn === t) return "Due today";
  if (f.sendOn < t) return `Overdue since ${pretty}`;
  return `Send ${pretty}`;
}

export function isDue(f: FollowUp): boolean {
  return f.status === "draft" && f.sendOn <= today();
}

export function formatDuration(ms: number): string {
  const sec = Math.round(ms / 1000);
  return sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`;
}

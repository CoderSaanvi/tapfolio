"use client";

import { useEffect, useState, type FormEvent } from "react";
import { trackingContext } from "@/lib/track";

interface LeaveInfoProps {
  slug: string;
  firstName: string;
}

const input =
  "w-full rounded-xl border border-line bg-wash px-3.5 py-2.5 text-[16px] text-ink placeholder:text-ink-2/60 focus:border-scarlet focus:outline-none";

/**
 * Lets whoever scanned the card hand over their details, so the owner's
 * Network knows who they are and can follow up. One submission per tab.
 */
export function LeaveInfo({ slug, firstName }: LeaveInfoProps) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const doneKey = `tapfolio:left-info:${slug}`;

  useEffect(() => {
    try {
      if (sessionStorage.getItem(doneKey)) setDone(true);
    } catch {
      // Private mode; the form just shows again.
    }
  }, [doneKey]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const ctx = trackingContext();
    const body = {
      slug,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      company: String(form.get("company") ?? ""),
      role: String(form.get("role") ?? ""),
      note: String(form.get("note") ?? ""),
      sessionId: ctx?.sessionId,
      conversationId: ctx?.conversationId,
      eventName: ctx?.eventName,
      audience: ctx?.audience,
    };
    try {
      const res = await fetch("/api/visitors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = (await res.json()) as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error ?? "Could not send");
      setDone(true);
      try {
        sessionStorage.setItem(doneKey, "1");
      } catch {
        // Fine without it.
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="rounded-[28px] border border-line bg-card px-5 py-4 font-sys text-sm">
        <p className="m-0 font-semibold text-ink">Thanks, {firstName} has your info.</p>
        <p className="m-0 mt-0.5 text-ink-2">They&apos;ll follow up with you after the event.</p>
      </section>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-track="leave-info-open"
        data-label="Opened leave-your-info"
        className="flex w-full items-center justify-between gap-3 rounded-[28px] border border-line bg-card px-5 py-4 text-left font-sys"
      >
        <span>
          <span className="block text-[15px] font-semibold text-ink">Met {firstName}? Leave your info</span>
          <span className="block text-xs text-ink-2">So they can follow up with you. Takes 10 seconds.</span>
        </span>
        <span className="text-xl text-scarlet-bright">→</span>
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2.5 rounded-[28px] border border-line border-t-[3px] border-t-scarlet bg-card p-5 font-sys">
      <p className="m-0 text-[15px] font-semibold text-ink">Leave your info for {firstName}</p>
      <input name="name" placeholder="Your name" autoComplete="name" className={input} />
      <input name="email" type="email" placeholder="Email" autoComplete="email" inputMode="email" className={input} />
      <div className="grid grid-cols-2 gap-2.5">
        <input name="company" placeholder="Company" autoComplete="organization" className={input} />
        <input name="role" placeholder="Role" autoComplete="organization-title" className={input} />
      </div>
      <textarea name="note" placeholder={`A note for ${firstName} (optional)`} rows={2} className={input} />
      {error && <p className="m-0 text-xs text-scarlet-bright">{error}</p>}
      <div className="mt-1 flex items-center gap-2">
        <button type="submit" disabled={busy} data-track="leave-info" data-label="Left their info" className="flex-1 rounded-xl bg-scarlet px-4 py-3 text-[15px] font-semibold text-white disabled:opacity-50">
          {busy ? "Sending…" : `Send to ${firstName}`}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm text-ink-2">
          Not now
        </button>
      </div>
    </form>
  );
}

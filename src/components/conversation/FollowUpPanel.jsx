"use client";

import { useState } from "react";
import { dueLabel } from "@/lib/followup-status";

export function FollowUpPanel({ followUp: f, email, drafting, onDraft, onChange, onSave }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!f) return;
    try {
      await navigator.clipboard.writeText(`Subject: ${f.subject}\n\n${f.body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked; the text is still selectable.
    }
  }

  const mailto = f ? `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(f.subject)}&body=${encodeURIComponent(f.body)}` : "";
  const input = "rounded-lg border border-line px-3 py-2 text-[15px] text-ink outline-none focus:border-scarlet";

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line border-t-4 border-t-scarlet bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Follow-up</h2>
        {f && <span className="rounded-full bg-scarlet-tint px-2.5 py-1 text-xs font-semibold text-scarlet-bright">{dueLabel(f)}</span>}
      </div>

      {!f && (
        <p className="text-sm text-ink-2">
          Claude reads the transcript, your notes, and what they looked at on your card, then drafts a tailored email to send in a couple of days.
        </p>
      )}

      {f && (
        <>
          <input
            value={f.subject}
            onChange={(e) => onChange({ ...f, subject: e.target.value })}
            onBlur={() => onSave({ subject: f.subject })}
            className={`${input} font-semibold`}
            aria-label="Subject"
          />
          <textarea
            value={f.body}
            onChange={(e) => onChange({ ...f, body: e.target.value })}
            onBlur={() => onSave({ body: f.body })}
            rows={12}
            className={`${input} leading-relaxed`}
            aria-label="Email body"
          />
          <label className="flex items-center gap-2 text-sm text-ink-2">
            Send on
            <input
              type="date"
              value={f.sendOn}
              onChange={(e) => {
                onChange({ ...f, sendOn: e.target.value });
                onSave({ sendOn: e.target.value });
              }}
              className={input}
            />
          </label>
          {f.highlights.length > 0 && (
            <ul className="list-disc rounded-lg bg-wash py-2 pl-7 pr-3 text-[13px] text-ink-2">
              {f.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={mailto}
              className="rounded-xl bg-gradient-to-b from-scarlet to-scarlet-deep py-3 text-center text-sm font-semibold text-white no-underline"
            >
              Open in Mail
            </a>
            <button type="button" onClick={copy} className="rounded-xl border border-line py-3 text-sm font-semibold">
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              type="button"
              onClick={() => onSave({ status: f.status === "sent" ? "draft" : "sent" })}
              className="rounded-xl border border-line py-3 text-sm font-semibold"
            >
              {f.status === "sent" ? "Mark as not sent" : "Mark as sent"}
            </button>
            <button
              type="button"
              onClick={onDraft}
              disabled={drafting}
              className="rounded-xl border border-line py-3 text-sm font-semibold disabled:opacity-60"
            >
              {drafting ? "Drafting…" : "Redraft"}
            </button>
          </div>
        </>
      )}

      {!f && (
        <button
          type="button"
          onClick={onDraft}
          disabled={drafting}
          className="rounded-xl bg-gradient-to-b from-scarlet to-scarlet-deep py-3.5 font-semibold text-white disabled:opacity-60"
        >
          {drafting ? "Drafting with Claude…" : "Draft follow-up"}
        </button>
      )}
    </section>
  );
}

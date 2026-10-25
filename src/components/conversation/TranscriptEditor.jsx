"use client";

export function TranscriptEditor({ transcript, notes, onChange, onSave }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-5">
      <h2 className="font-display text-2xl font-semibold tracking-tight">The conversation</h2>
      <label className="flex flex-col gap-1 text-xs text-ink-2">
        Transcript (fix anything the mic misheard)
        <textarea
          value={transcript}
          onChange={(e) => onChange({ transcript: e.target.value, notes })}
          onBlur={onSave}
          rows={8}
          placeholder="Nothing recorded. Type what you talked about, or paste it in."
          className="rounded-lg border border-line px-3 py-2 text-[15px] leading-relaxed text-ink outline-none focus:border-scarlet"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink-2">
        Your notes
        <textarea
          value={notes}
          onChange={(e) => onChange({ transcript, notes: e.target.value })}
          onBlur={onSave}
          rows={3}
          placeholder="e.g. Asked me to apply to the Summer R&D role; mentioned their imaging team"
          className="rounded-lg border border-line px-3 py-2 text-[15px] text-ink outline-none focus:border-scarlet"
        />
      </label>
    </section>
  );
}

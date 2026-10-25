"use client";

import { useEffect } from "react";

const EVENT_KEY = "tapfolio:event";

/** "Where are you?" input, remembered on this device between events. */
export function EventField({ value, onChange }) {
  useEffect(() => {
    try {
      onChange(localStorage.getItem(EVENT_KEY) ?? "");
    } catch {
      // Private mode: start blank.
    } // Load once on mount.
  }, [onChange]);

  function update(v) {
    onChange(v);
    try {
      localStorage.setItem(EVENT_KEY, v);
    } catch {
      // Not persisted; still used for this session.
    }
  }

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] uppercase tracking-[.2em] text-ink-2">Where are you?</span>
      <input
        value={value}
        onChange={(e) => update(e.target.value)}
        placeholder="e.g. OSU Engineering Career Fair"
        className="rounded-xl border border-line bg-card px-3.5 py-3 text-[15px] outline-none focus:border-scarlet"
      />
    </label>
  );
}

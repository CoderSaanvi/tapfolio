"use client";

import type { RecruiterInfo } from "@/lib/types";

interface RecruiterFieldsProps {
  value: RecruiterInfo;
  onChange: (v: RecruiterInfo) => void;
  onSave: () => void;
}

const FIELDS: { key: keyof RecruiterInfo; label: string; type?: string }[] = [
  { key: "name", label: "Name" },
  { key: "company", label: "Company" },
  { key: "role", label: "Role" },
  { key: "email", label: "Email", type: "email" },
];

export function RecruiterFields({ value, onChange, onSave }: RecruiterFieldsProps) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="mb-3 font-display text-2xl font-extrabold uppercase">Who you met</h2>
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <label key={f.key} className="flex flex-col gap-1 text-xs text-ink-2">
            {f.label}
            <input
              type={f.type ?? "text"}
              value={value[f.key]}
              onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}
              onBlur={onSave}
              placeholder={f.key === "email" ? "From their card or badge" : "Claude fills this from the transcript"}
              className="rounded-lg border border-line px-2.5 py-2 text-[15px] text-ink outline-none focus:border-scarlet"
            />
          </label>
        ))}
      </div>
    </section>
  );
}

"use client";

const FIELDS = [
  { key: "displayName", label: "Name to show on your card", placeholder: "e.g. Kaushik Burra (blank = name on your resume)" },
  { key: "pronouns", label: "Pronouns", placeholder: "e.g. he/him (optional)" },
  { key: "targetRoles", label: "What roles are you going for?", placeholder: "e.g. Medical device R&D internships, AI product roles", long: true },
  { key: "building", label: "What are you building right now?", placeholder: "e.g. A computer-vision tool that checks dance timing", long: true },
  { key: "tagline", label: "One line you want recruiters to remember", placeholder: "e.g. Let's build better healthcare together." },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you", type: "url" },
  { key: "github", label: "GitHub", placeholder: "github.com/you", type: "url" },
  { key: "email", label: "Email", placeholder: "Leave blank to use your resume's", type: "email" },
  { key: "phone", label: "Phone", placeholder: "Leave blank to use your resume's", type: "tel" },
];

const input =
  "w-full rounded-xl border border-line bg-wash px-3.5 py-3 text-[16px] text-ink outline-none placeholder:text-ink-2/60 focus:border-scarlet-bright";

/** Everything is optional; Claude fills gaps from the resume. Inputs are 16px so iOS doesn't zoom on focus. */
export function QuestionsStep({ answers, onChange }) {
  return (
    <div className="flex flex-col gap-4">
      {FIELDS.map((f) => (
        <label key={f.key} className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">{f.label}</span>
          {f.long ? (
            <textarea
              rows={2}
              value={answers[f.key]}
              onChange={(e) => onChange({ ...answers, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              className={input}
            />
          ) : (
            <input
              type={f.type ?? "text"}
              value={answers[f.key]}
              onChange={(e) => onChange({ ...answers, [f.key]: e.target.value })}
              placeholder={f.placeholder}
              autoCapitalize={f.type ? "none" : "sentences"}
              className={input}
            />
          )}
        </label>
      ))}
    </div>
  );
}

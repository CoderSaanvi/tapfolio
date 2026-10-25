export function SectionTitle({ title, sub, right }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-sora text-[26px] font-semibold tracking-tight">{title}</h2>
        {sub && <p className="mt-1 text-sm text-ink-2">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

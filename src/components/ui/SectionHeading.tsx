interface SectionHeadingProps {
  title: string;
  sub?: string;
}

export function SectionHeading({ title, sub }: SectionHeadingProps) {
  return (
    <div className="mb-7">
      <h2 className="font-display text-[clamp(34px,5vw,48px)] font-extrabold uppercase leading-none after:mt-2.5 after:block after:h-[5px] after:w-14 after:bg-scarlet">
        {title}
      </h2>
      {sub && <p className="mt-3 max-w-[40em] text-ink-2">{sub}</p>}
    </div>
  );
}

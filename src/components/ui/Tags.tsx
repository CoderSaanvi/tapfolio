interface TagsProps {
  items: string[];
}

export function Tags({ items }: TagsProps) {
  return (
    <ul className="m-0 flex list-none flex-wrap gap-1.5 p-0">
      {items.map((t) => (
        <li key={t} className="rounded-md bg-wash px-2 py-0.5 font-mono text-xs text-ink">
          {t}
        </li>
      ))}
    </ul>
  );
}

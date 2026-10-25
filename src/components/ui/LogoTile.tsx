import Image from "next/image";

interface LogoTileProps {
  logo?: string;
  mark?: string;
  size?: "sm" | "md";
}

/** OSU gets the Block O; any other school gets its initials. */
export function schoolLogo(school: string): { logo?: string; mark?: string } {
  if (/ohio state/i.test(school)) return { logo: "/osu-logo.svg" };
  const mark = school.replace(/^the\s+/i, "").split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 3).map((w) => w[0]).join("");
  return { mark: mark || "U" };
}

/** Square logo tile. Images sit on white so dark marks (like the Block O lettering) stay legible. */
export function LogoTile({ logo, mark, size = "md" }: LogoTileProps) {
  const box = size === "sm" ? "h-10 w-10 rounded-[10px]" : "h-12 w-12 rounded-xl";
  if (logo) {
    return (
      <span className={`relative flex-none overflow-hidden border border-line bg-white p-1.5 ${box}`}>
        <Image src={logo} alt="" fill sizes="48px" className="object-contain p-1.5" />
      </span>
    );
  }
  return (
    <span className={`grid flex-none place-items-center border border-line bg-wash font-mono text-sm font-medium text-scarlet-bright ${box}`}>
      {mark ?? "•"}
    </span>
  );
}

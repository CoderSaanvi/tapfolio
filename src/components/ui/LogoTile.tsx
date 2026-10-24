import Image from "next/image";

interface LogoTileProps {
  logo?: string;
  mark?: string;
  size?: "sm" | "md";
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

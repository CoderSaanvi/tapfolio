import { Icon, type IconName } from "@/components/ui/Icon";
import type { Profile } from "@/lib/types";

interface QuickActionsProps {
  contact: Profile["contact"];
}

export function QuickActions({ contact }: QuickActionsProps) {
  const actions: { label: string; href: string; icon: IconName; external?: boolean }[] = [
    { label: "Call", href: `tel:${contact.phone}`, icon: "phone" },
    { label: "Email", href: `mailto:${contact.email}`, icon: "mail" },
    { label: "LinkedIn", href: contact.linkedin, icon: "linkedin", external: true },
  ];

  return (
    <div className="mt-2 grid grid-cols-3 gap-2">
      {actions.map((a) => (
        <a
          key={a.label}
          href={a.href}
          {...(a.external ? { target: "_blank", rel: "noopener" } : {})}
          data-track={`quick:${a.label.toLowerCase()}`}
          data-label={`Tapped ${a.label}`}
          className="flex flex-col items-center gap-1.5 rounded-[13px] border border-line bg-white px-1.5 py-3 text-[11.5px] tracking-wide text-ink no-underline hover:bg-scarlet/[.04]"
        >
          <Icon name={a.icon} className="h-[18px] w-[18px] text-scarlet" />
          <span>{a.label}</span>
        </a>
      ))}
    </div>
  );
}

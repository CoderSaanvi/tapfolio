"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";

const TABS = [
  { label: "Share", href: "/", icon: "qr", match: (p) => p === "/" },
  { label: "Activity", href: "/activity", icon: "activity", match: (p) => p.startsWith("/activity") || p.startsWith("/conversations") },
  { label: "Network", href: "/network", icon: "people", match: (p) => p.startsWith("/network") },
];

/** iOS-style bottom tab bar for the owner screens. */
export function OwnerTabBar() {
  const path = usePathname() ?? "/";
  return (
    <nav
      aria-label="App"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-night/85 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-md justify-around">
        {TABS.map((t) => {
          const active = t.match(path);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? "page" : undefined}
              className={`flex w-24 flex-col items-center gap-1 py-1 text-[11px] font-medium no-underline ${active ? "text-scarlet-bright" : "text-ink-2"}`}
            >
              <Icon name={t.icon} className="h-6 w-6" />
              {t.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

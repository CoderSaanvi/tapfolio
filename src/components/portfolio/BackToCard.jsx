"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

/** Floating pill on phones: once the card scrolls away, one tap brings it back. */
export function BackToCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const card = document.getElementById("card");
    if (!card) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting), { threshold: 0 });
    io.observe(card);
    return () => io.disconnect();
  }, []);

  if (!show) return null;
  return (
    <a
      href="#card"
      data-track="back-to-card"
      data-label="Back to card"
      className="fixed bottom-[max(20px,env(safe-area-inset-bottom))] left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-card/90 px-4 py-2.5 text-sm font-medium text-ink no-underline shadow-card backdrop-blur-xl lg:hidden"
    >
      <Icon name="up" className="h-4 w-4 text-scarlet-bright" /> Contact card
    </a>
  );
}

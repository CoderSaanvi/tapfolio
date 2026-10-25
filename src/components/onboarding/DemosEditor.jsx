"use client";

import Link from "next/link";
import { useState } from "react";
import { ProjectDemoRow } from "./ProjectDemoRow";
import { StepShell, primaryButton } from "./StepShell";

/** Optional: attach demo videos, photos, or links to the projects Claude found. Saves as you go. */
export function DemosEditor({ profile: initial, fromOnboarding }) {
  const [profile, setProfile] = useState(initial);
  const withDemos = profile.projects.filter((p) => (p.media?.length ?? 0) > 0 || p.links?.length).length;
  const done = fromOnboarding ? "/?built=1" : "/";

  return (
    <StepShell
      step={3}
      total={4}
      title="Show your projects in action"
      sub="Optional. Add a demo video, screenshots, or a link to any project. Recruiters can watch it right on your card."
      footer={
        <div className="flex flex-col gap-2">
          <Link href={done} className={`${primaryButton} no-underline`}>
            {withDemos ? `Done · ${withDemos} project${withDemos === 1 ? "" : "s"} with demos` : fromOnboarding ? "Skip for now" : "Done"}
          </Link>
        </div>
      }
    >
      {profile.projects.map((p, i) => (
        <ProjectDemoRow key={p.id} project={p} index={i} onUpdated={setProfile} />
      ))}
    </StepShell>
  );
}

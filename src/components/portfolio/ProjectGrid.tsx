import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProjectTile } from "./ProjectTile";
import type { Project } from "@/lib/types";

interface ProjectGridProps {
  projects: Project[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <section id="projects">
      <SectionTitle title="Projects" sub="Tap any project to open it." />
      <div className="grid grid-flow-dense gap-3 sm:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectTile key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}

import { router, useLocalSearchParams } from "expo-router";
import { Button, Screen, Sub } from "@/components/ui";
import { ProjectDemoCard } from "@/components/ProjectDemoCard";
import { useSession } from "@/lib/session";

/** Attach demo videos, photos, or a link to each project. Last onboarding step, and in the Share tab later. */
export default function Demos() {
  const { profile, setProfile } = useSession();
  const { new: isNew } = useLocalSearchParams<{ new?: string }>();
  if (!profile) return null;

  const withDemos = profile.projects.filter((p) => (p.media?.length ?? 0) > 0 || p.links?.some((l) => l.label === "Watch demo")).length;
  const done = () => (isNew ? router.replace("/") : router.back());

  return (
    <Screen
      padTop={false}
      footer={<Button title={withDemos ? `Done · ${withDemos} project${withDemos === 1 ? "" : "s"} with demos` : isNew ? "Skip for now" : "Done"} onPress={done} />}
    >
      <Sub>Optional. Add a demo video, screenshots, or a link to any project. Recruiters can watch it right on your card.</Sub>
      {profile.projects.map((p, i) => (
        <ProjectDemoCard key={p.id} project={p} index={i} onUpdated={setProfile} />
      ))}
    </Screen>
  );
}

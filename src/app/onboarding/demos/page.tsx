import { redirect } from "next/navigation";
import { DemosEditor } from "@/components/onboarding/DemosEditor";
import { getOwnerProfile } from "@/lib/profiles";

export const dynamic = "force-dynamic";
export const metadata = { title: "Project demos" };

interface DemosPageProps {
  searchParams: { new?: string };
}

/** Last onboarding step, and reachable later from the share screen. */
export default async function DemosPage({ searchParams }: DemosPageProps) {
  const profile = await getOwnerProfile().catch(() => undefined);
  if (!profile) redirect("/onboarding");
  return <DemosEditor profile={profile} fromOnboarding={searchParams.new === "1"} />;
}

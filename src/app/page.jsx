import { redirect } from "next/navigation";
import { ShareScreen } from "@/components/share/ShareScreen";
import { getOwnerProfile } from "@/lib/profiles";

export const dynamic = "force-dynamic";

/** Home of the owner app. First launch on a phone goes to onboarding to build the card. */
export default async function SharePage({ searchParams }) {
  const profile = await getOwnerProfile().catch(() => undefined);
  if (!profile) redirect("/onboarding");
  return <ShareScreen profile={profile} justBuilt={searchParams.built === "1"} />;
}

import { ShareScreen } from "@/components/share/ShareScreen";
import { ownerProfile } from "@/data/profile";

export default function SharePage() {
  return <ShareScreen profile={ownerProfile} />;
}

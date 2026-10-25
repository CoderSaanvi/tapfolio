import { Redirect } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { useSession } from "@/lib/session";

/** Share + Activity. A phone that doesn't own a card yet goes to onboarding instead. */
export default function TabsLayout() {
  const { status } = useSession();
  if (status === "loading") return null;
  if (status === "signedOut") return <Redirect href="/onboarding" />;

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="qrcode" md="qr_code" />
        <NativeTabs.Trigger.Label>Share</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="activity">
        <NativeTabs.Trigger.Icon sf="waveform.path.ecg" md="monitoring" />
        <NativeTabs.Trigger.Label>Activity</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

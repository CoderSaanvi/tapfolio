import { Image } from "expo-image";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { ShareBlock } from "@/components/ShareBlock";
import { Button, ErrorText, Field, Label, Screen } from "@/components/ui";
import { absolute, api, API_URL } from "@/lib/api";
import { useSession } from "@/lib/session";
import { C } from "@/lib/theme";

const EVENT_KEY = "tapfolio.event";

/** Home: the QR and Tap to share first; starting a conversation and settings below. */
export default function ShareScreen() {
  const { profile, error, refresh, signOut } = useSession();
  const [eventName, setEventName] = useState("");
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  const [banner, setBanner] = useState(null);
  const [bannerError, setBannerError] = useState(null);

  useEffect(() => {
    SecureStore.getItemAsync(EVENT_KEY)
      .then((v) => v && setEventName(v))
      .catch(() => undefined);
  }, []);

  async function saveBanner() {
    if (banner === null || !profile) return;
    const current = profile.banner?.text ?? profile.school?.name ?? "";
    if (banner.trim() === current.trim()) return;
    try {
      await api("/api/profile/me", { method: "PATCH", body: { banner: { text: banner.trim() } } });
      setBannerError(null);
      void refresh();
    } catch (e) {
      setBannerError(e instanceof Error ? e.message : "Couldn't save the banner.");
    }
  }

  function updateEvent(v) {
    setEventName(v);
    SecureStore.setItemAsync(EVENT_KEY, v).catch(() => undefined);
  }

  if (!profile) {
    return (
      <Screen>
        <ErrorText>{error ?? "Loading your card…"}</ErrorText>
        {error && <Button title="Try again" kind="secondary" onPress={refresh} />}
      </Screen>
    );
  }

  const cardUrl = `${API_URL}/c/${profile.slug}${eventName.trim() ? `?ev=${encodeURIComponent(eventName.trim())}` : ""}`;

  async function start() {
    setStarting(true);
    setStartError(null);
    try {
      const { id } = await api("/api/conversations", { method: "POST", body: { eventName: eventName.trim() } });
      router.push({ pathname: "/conversation/[id]", params: { id, live: "1" } });
    } catch (e) {
      setStartError(e instanceof Error ? e.message : "Couldn't start.");
    } finally {
      setStarting(false);
    }
  }

  function rebuild() {
    Alert.alert("Rebuild your card?", "You'll upload a new resume and Claude builds a new card. Your current card link keeps working.", [
      { text: "Cancel", style: "cancel" },
      { text: "Rebuild", onPress: () => signOut().then(() => router.replace("/onboarding")) },
    ]);
  }

  return (
    <Screen>
      <View style={s.header}>
        <Image source={{ uri: absolute(profile.photo) }} style={s.avatar} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <Text style={s.name}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={s.status}>● Ready to share</Text>
        </View>
        <Pressable onPress={() => Linking.openURL(`${API_URL}/c/${profile.slug}`)} style={s.pill}>
          <Text style={s.pillText}>Preview card</Text>
        </Pressable>
      </View>

      <ShareBlock url={cardUrl} name={`${profile.firstName} ${profile.lastName}`} />
      {profile.contact && (
        <Text style={s.small}>
          Call and Email on your card go to{" "}
          {[profile.contact.phone, profile.contact.email].filter(Boolean).join(" and ") || "nothing yet: rebuild with a resume that lists them"}.
        </Text>
      )}

      <Label>Your card</Label>
      <Field
        label="Banner across the top"
        value={banner ?? profile.banner?.text ?? profile.school?.name ?? ""}
        onChangeText={setBanner}
        onBlur={saveBanner}
        placeholder="e.g. The Ohio State University (blank hides it)"
      />

      <Text style={s.small}>Shows with the school logo when it names a school we know.</Text>
      <ErrorText>{bannerError}</ErrorText>

      <Label>At the booth</Label>
      <Field label="Where are you?" value={eventName} onChangeText={updateEvent} placeholder="e.g. OSU Engineering Career Fair" />
      <Button title="● Start conversation" kind="secondary" onPress={start} loading={starting} />
      <Text style={s.small}>Opens a live screen for this recruiter: share from there, and dictate notes. Ask before recording.</Text>
      <ErrorText>{startError}</ErrorText>

      <Pressable onPress={() => router.push("/demos")} style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: C.ink, fontWeight: "600" }}>Project demos</Text>
          <Text style={s.small}>Add videos, photos, or links to your projects</Text>
        </View>
        <Text style={{ color: C.ink2, fontSize: 20 }}>›</Text>
      </Pressable>
      <Button title="New resume? Rebuild my card" kind="ghost" onPress={rebuild} />
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: C.scarlet },
  name: { color: C.ink, fontSize: 17, fontWeight: "600" },
  status: { color: C.green, fontSize: 12 },
  pill: { borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, backgroundColor: C.card, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  pillText: { color: C.ink, fontSize: 12, fontWeight: "500" },
  small: { color: C.ink2, fontSize: 12, lineHeight: 17 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
    padding: 16,
    marginTop: 8,
  },
});

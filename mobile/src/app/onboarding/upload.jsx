import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, ErrorText, H1, Screen } from "@/components/ui";
import { useOnboarding } from "@/lib/onboarding";
import { C } from "@/lib/theme";

export default function Upload() {
  const { photo, resume, setPhoto, setResume } = useOnboarding();
  const [error, setError] = useState(null);

  async function pickPhoto() {
    setError(null);
    // quality < 1 makes iOS re-encode to JPEG, so HEIC photos upload fine.
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 5], quality: 0.8 });
    if (r.canceled) return;
    const a = r.assets[0];
    setPhoto({ uri: a.uri, mimeType: a.mimeType === "image/png" ? "image/png" : "image/jpeg" });
  }

  async function pickResume() {
    setError(null);
    const r = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
    if (r.canceled) return;
    const f = r.assets[0];
    if ((f.size ?? 0) > 8 * 1024 * 1024) return setError("That PDF is over 8 MB. Export a smaller one.");
    setResume({ uri: f.uri, mimeType: "application/pdf", name: f.name });
  }

  return (
    <Screen footer={<Button title="Continue" disabled={!photo || !resume} onPress={() => router.push("/onboarding/questions")} />}>
      <View style={{ height: 40 }} />
      <H1>Add your photo and resume</H1>

      <Pressable onPress={pickPhoto} style={s.photoCard}>
        <View style={s.circle}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <Text style={{ color: C.ink2, fontSize: 36 }}>＋</Text>
          )}
        </View>
        <Text style={s.title}>{photo ? "Change photo" : "Add your photo"}</Text>
        <Text style={s.sub}>A clear headshot works best</Text>
      </Pressable>

      <Pressable onPress={pickResume} style={s.row}>
        <View style={[s.icon, resume && { backgroundColor: "rgba(52,211,153,0.15)" }]}>
          <Text style={{ color: resume ? C.green : C.scarletBright, fontWeight: "700" }}>PDF</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{resume ? "Resume added" : "Upload your resume"}</Text>
          <Text style={s.sub} numberOfLines={1}>
            {resume?.name ?? "From Files or iCloud Drive"}
          </Text>
        </View>
        <Text style={{ color: C.ink2, fontSize: 20 }}>›</Text>
      </Pressable>
      <ErrorText>{error}</ErrorText>
    </Screen>
  );
}

const s = StyleSheet.create({
  photoCard: {
    alignItems: "center",
    gap: 8,
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
    paddingVertical: 28,
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.wash,
    borderWidth: 2,
    borderColor: C.line,
    borderStyle: "dashed",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
    padding: 18,
  },
  icon: { width: 48, height: 48, borderRadius: 14, backgroundColor: C.scarletTint, alignItems: "center", justifyContent: "center" },
  title: { color: C.ink, fontSize: 16, fontWeight: "600" },
  sub: { color: C.ink2, fontSize: 12 },
});

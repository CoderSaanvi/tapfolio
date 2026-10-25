import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Card, ErrorText } from "@/components/ui";
import { absolute, api, uploadFile } from "@/lib/api";
import { C } from "@/lib/theme";

const DEMO_LABEL = "Watch demo";

export function ProjectDemoCard({ project: p, index, onUpdated }) {
  const saved = p.links?.find((l) => l.label === DEMO_LABEL)?.href ?? "";
  const [link, setLink] = useState(saved);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  async function act(body) {
    setError(null);
    try {
      onUpdated(await api("/api/profile/media", { method: "POST", body: { ...body, projectId: p.id } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save.");
    }
  }

  async function pick(kind) {
    setError(null);
    if (kind === "videos") await ImagePicker.requestMediaLibraryPermissionsAsync();
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: [kind], quality: 0.8, videoMaxDuration: 180 });
    if (r.canceled) return;
    const a = r.assets[0];
    const mime = kind === "videos" ? (a.mimeType === "video/mp4" ? "video/mp4" : "video/quicktime") : a.mimeType === "image/png" ? "image/png" : "image/jpeg";
    if (kind === "videos" && (a.fileSize ?? 0) > 200 * 1024 * 1024) return setError("Videos must be under 200 MB. Trim it in Photos first.");
    setProgress(0);
    try {
      const url = await uploadFile(a.uri, mime, setProgress);
      await act({ action: "add", url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setProgress(null);
    }
  }

  function saveLink() {
    const v = link.trim();
    if (v === saved) return;
    if (!v) return void act({ action: "removeLink" });
    void act({ action: "link", url: /^https?:\/\//.test(v) ? v : `https://${v}` });
  }

  return (
    <Card>
      <Text style={s.num}>{String(index + 1).padStart(2, "0")}</Text>
      <Text style={s.title}>{p.title}</Text>
      {p.blurb ? <Text style={s.sub}>{p.blurb}</Text> : null}

      {(p.media?.length ?? 0) > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {p.media?.map((m) => (
            <View key={m.id} style={s.thumb}>
              {m.kind === "image" ? (
                <Image source={{ uri: absolute(m.src) }} style={StyleSheet.absoluteFill} contentFit="cover" />
              ) : (
                <Text style={s.video}>▶ video</Text>
              )}
              <Pressable onPress={() => act({ action: "removeMedia", mediaId: m.id })} style={s.remove} hitSlop={8}>
                <Text style={{ color: "#fff", fontSize: 12 }}>✕</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {progress !== null ? (
        <View style={s.bar}>
          <View style={[s.fill, { width: `${Math.max(progress, 6)}%` }]} />
          <Text style={s.pct}>{progress}%</Text>
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={() => pick("videos")} style={s.pill}>
            <Text style={s.pillText}>＋ Video</Text>
          </Pressable>
          <Pressable onPress={() => pick("images")} style={s.pill}>
            <Text style={s.pillText}>＋ Photo</Text>
          </Pressable>
        </View>
      )}

      <TextInput
        value={link}
        onChangeText={setLink}
        onBlur={saveLink}
        placeholder="Demo link (YouTube, Loom, live site)"
        placeholderTextColor="rgba(154,159,163,0.6)"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        keyboardAppearance="dark"
        style={s.input}
      />

      <ErrorText>{error}</ErrorText>
    </Card>
  );
}

const s = StyleSheet.create({
  num: { color: C.scarletBright, fontFamily: "Menlo", fontSize: 12 },
  title: { color: C.ink, fontSize: 16, fontWeight: "600" },
  sub: { color: C.ink2, fontSize: 12 },
  thumb: { width: 112, height: 80, borderRadius: 12, overflow: "hidden", backgroundColor: C.wash, alignItems: "center", justifyContent: "center" },
  video: { color: C.ink, fontSize: 12 },
  remove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    flex: 1,
    backgroundColor: C.wash,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
    paddingVertical: 11,
    alignItems: "center",
  },
  pillText: { color: C.ink, fontSize: 14, fontWeight: "500" },
  bar: { height: 40, borderRadius: 12, backgroundColor: C.wash, overflow: "hidden", justifyContent: "center" },
  fill: { position: "absolute", left: 0, top: 0, bottom: 0, backgroundColor: "rgba(186,12,47,0.45)" },
  pct: { color: C.ink, paddingLeft: 12, fontSize: 13 },
  input: {
    backgroundColor: C.wash,
    color: C.ink,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
  },
});

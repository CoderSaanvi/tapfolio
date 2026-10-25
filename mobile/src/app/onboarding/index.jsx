import { router } from "expo-router";
import { Linking, StyleSheet, Text, View } from "react-native";
import { Button, Card, H1, Screen, Sub } from "@/components/ui";
import { API_URL } from "@/lib/api";
import { C } from "@/lib/theme";

const POINTS = ["Tap phones or show a QR to share", "Recruiters see your projects, not just a PDF", "Claude drafts your follow-up email after"];

export default function Welcome() {
  return (
    <Screen footer={<Button title="Get started" onPress={() => router.push("/onboarding/upload")} />}>
      <View style={{ height: 24 }} />
      <H1>Your resume, as a card recruiters remember</H1>
      <Sub>Upload your resume and a photo. Tapfolio builds your contact card and live portfolio, ready to share with a tap.</Sub>
      <View style={{ gap: 10, marginTop: 10 }}>
        {POINTS.map((p) => (
          <Card key={p} style={s.point}>
            <View style={s.dot} />
            <Text style={s.pointText}>{p}</Text>
          </Card>
        ))}
      </View>
      {API_URL ? (
        <Text style={s.link} onPress={() => Linking.openURL(`${API_URL}/c/kaushik`)}>
          See an example card
        </Text>
      ) : (
        <Text style={[s.link, { color: C.scarletBright }]}>Set EXPO_PUBLIC_API_URL in mobile/.env.local, then reload.</Text>
      )}
    </Screen>
  );
}

const s = StyleSheet.create({
  point: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.scarletBright },
  pointText: { color: C.ink, fontSize: 15, flex: 1 },
  link: { color: C.ink2, fontSize: 14, textAlign: "center", marginTop: 8, textDecorationLine: "underline" },
});

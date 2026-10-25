import { ActionSheetIOS, Alert, Platform, Share, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Button, Card } from "@/components/ui";
import { QrCode } from "@/components/QrCode";
import { C } from "@/lib/theme";
import type { Audience } from "@/lib/types";

const AUDIENCES: { key: Audience; title: string; message: (name: string) => string }[] = [
  { key: "recruiter", title: "For a recruiter", message: (name) => `${name} · portfolio & resume` },
  { key: "student", title: "For a student", message: (name) => `${name} · let's stay connected` },
];

/**
 * QR + Tap to share for one card link. `src` tags how the recruiter opened it and
 * `for` who they are (both show in Activity); the card leads with what that person wants.
 */
export function ShareBlock({ url, name }: { url: string; name: string }) {
  const { width } = useWindowDimensions();
  const qrSize = Math.min(240, width - 120);
  const withParams = (params: Record<string, string>) => {
    const q = new URLSearchParams(params).toString();
    return `${url}${url.includes("?") ? "&" : "?"}${q}`;
  };

  async function shareTo(a: (typeof AUDIENCES)[number]) {
    try {
      // iOS share sheet: AirDrop sits at the top; bring the phones close together.
      await Share.share({ url: withParams({ src: "tap", for: a.key }), message: a.message(name) });
    } catch {
      // Dismissed; nothing to do.
    }
  }

  function share() {
    const titles = AUDIENCES.map((a) => a.title);
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { title: "Who are you sharing with?", options: [...titles, "Cancel"], cancelButtonIndex: titles.length, userInterfaceStyle: "dark" },
        (i) => AUDIENCES[i] && shareTo(AUDIENCES[i]),
      );
    } else {
      Alert.alert("Who are you sharing with?", undefined, [...AUDIENCES.map((a) => ({ text: a.title, onPress: () => shareTo(a) })), { text: "Cancel", style: "cancel" as const }]);
    }
  }

  return (
    <Card accent style={{ alignItems: "center", gap: 14, paddingVertical: 20 }}>
      <View style={s.qr}>
        <QrCode value={withParams({ src: "qr" })} size={qrSize} />
      </View>
      <Text style={s.hint}>Have them point their camera here</Text>
      <View style={{ alignSelf: "stretch" }}>
        <Button title="Tap to share" onPress={share} />
      </View>
      <Text style={s.small}>
        Pick recruiter or student, choose <Text style={{ color: C.ink }}>AirDrop</Text>, and hold your phones together.
      </Text>
    </Card>
  );
}

const s = StyleSheet.create({
  qr: { backgroundColor: "#fff", padding: 14, borderRadius: 18 },
  hint: { color: C.ink2, fontSize: 13 },
  small: { color: C.ink2, fontSize: 12, textAlign: "center" },
});

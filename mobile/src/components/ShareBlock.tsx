import { Share, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Button, Card } from "@/components/ui";
import { QrCode } from "@/components/QrCode";
import { C } from "@/lib/theme";

/** QR + Tap to share for one card link. `src` tags how the recruiter opened it (shown in Activity). */
export function ShareBlock({ url, name }: { url: string; name: string }) {
  const { width } = useWindowDimensions();
  const qrSize = Math.min(240, width - 120);
  const withSrc = (src: string) => `${url}${url.includes("?") ? "&" : "?"}src=${src}`;

  async function share() {
    try {
      // iOS share sheet: AirDrop sits at the top; bring the phones close together.
      await Share.share({ url: withSrc("tap"), message: `${name} · portfolio` });
    } catch {
      // Dismissed; nothing to do.
    }
  }

  return (
    <Card accent style={{ alignItems: "center", gap: 14, paddingVertical: 20 }}>
      <View style={s.qr}>
        <QrCode value={withSrc("qr")} size={qrSize} />
      </View>
      <Text style={s.hint}>Have them point their camera here</Text>
      <View style={{ alignSelf: "stretch" }}>
        <Button title="Tap to share" onPress={share} />
      </View>
      <Text style={s.small}>
        Choose <Text style={{ color: C.ink }}>AirDrop</Text> and hold your phones together.
      </Text>
    </Card>
  );
}

const s = StyleSheet.create({
  qr: { backgroundColor: "#fff", padding: 14, borderRadius: 18 },
  hint: { color: C.ink2, fontSize: 13 },
  small: { color: C.ink2, fontSize: 12, textAlign: "center" },
});

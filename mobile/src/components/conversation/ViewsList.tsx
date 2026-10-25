import { StyleSheet, Text, View } from "react-native";
import { Card, Label } from "@/components/ui";
import { formatDuration } from "@/lib/followup";
import { C } from "@/lib/theme";
import type { ViewSession } from "@/lib/types";

/** What the recruiter looked at on your card: time per section and what they tapped. */
export function ViewsList({ sessions }: { sessions: ViewSession[] }) {
  return (
    <View style={{ gap: 10 }}>
      <Label>What they looked at</Label>
      {sessions.length === 0 && <Text style={s.empty}>They haven&apos;t opened your card from this conversation yet. If they do, it shows up here and a redraft uses it.</Text>}
      {sessions.map((v) => {
        const max = v.sections[0]?.ms ?? 1;
        return (
          <Card key={v.sessionId}>
            <View style={s.head}>
              <Text style={s.meta}>{v.device} · {v.openedVia}</Text>
              <Text style={s.total}>{formatDuration(v.totalMs)}</Text>
            </View>
            {v.sections.map((sec) => (
              <View key={sec.target} style={{ gap: 4 }}>
                <View style={s.head}>
                  <Text style={s.label} numberOfLines={1}>{sec.label}</Text>
                  <Text style={s.meta}>{formatDuration(sec.ms)}</Text>
                </View>
                <View style={s.track}>
                  <View style={[s.fill, { width: `${Math.max(4, (sec.ms / max) * 100)}%` }]} />
                </View>
              </View>
            ))}
            {v.clicks.length > 0 && <Text style={s.meta}>Tapped: {v.clicks.map((c) => c.label).join(" · ")}</Text>}
          </Card>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  empty: { color: C.ink2, fontSize: 13, lineHeight: 18 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  meta: { color: C.ink2, fontSize: 12 },
  total: { color: C.scarletBright, fontSize: 18, fontWeight: "700" },
  label: { color: C.ink, fontSize: 14, flex: 1 },
  track: { height: 6, borderRadius: 3, backgroundColor: C.wash, overflow: "hidden" },
  fill: { height: 6, borderRadius: 3, backgroundColor: C.scarlet },
});

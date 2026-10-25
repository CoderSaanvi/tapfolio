import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InsightsPanel } from "@/components/InsightsPanel";
import { ErrorText, H1, Sub } from "@/components/ui";
import { api } from "@/lib/api";
import { dueLabel, isDue } from "@/lib/followup";
import { C } from "@/lib/theme";
import type { Conversation, Insights } from "@/lib/types";

/** What viewers looked at most, then every conversation with follow-ups due first. Pull to refresh. */
export default function Activity() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Conversation[] | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [list, ins] = await Promise.all([api<Conversation[]>("/api/conversations"), api<Insights>("/api/insights")]);
      setItems([...list].sort((a, b) => Number(Boolean(b.followUp && isDue(b.followUp))) - Number(Boolean(a.followUp && isDue(a.followUp)))));
      setInsights(ins);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load activity.");
    }
  }, []);

  // Refresh on open and every 15 s while this tab is showing, so a scan at the booth shows up without a pull.
  useFocusEffect(
    useCallback(() => {
      void load();
      const t = setInterval(() => void load(), 15_000);
      return () => clearInterval(t);
    }, [load]),
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.night }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 120, gap: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={C.ink2} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      <H1>Activity</H1>
      <Sub>Who's looked at your card and what held them. Updates by itself.</Sub>
      <ErrorText>{error}</ErrorText>
      {insights && insights.views > 0 && <InsightsPanel insights={insights} />}
      <Text style={s.section}>Conversations</Text>
      {items?.length === 0 && (
        <View style={s.empty}>
          <Text style={s.emptyText}>Tap Start conversation on the Share tab when you walk up to a recruiter.</Text>
        </View>
      )}
      {items?.map((c) => {
        const chip = c.followUp ? dueLabel(c.followUp) : c.endedAt ? "Needs draft" : "In progress";
        const urgent = c.followUp ? isDue(c.followUp) : Boolean(c.endedAt);
        const who = [c.recruiter.name, c.recruiter.company].filter(Boolean).join(" · ") || "New contact";
        return (
          <Pressable key={c.id} onPress={() => router.push({ pathname: "/conversation/[id]", params: { id: c.id } })} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.who} numberOfLines={1}>{who}</Text>
              <Text style={s.meta} numberOfLines={1}>
                {c.eventName || "No event"} · {new Date(c.startedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </Text>
            </View>
            <View style={[s.chip, urgent ? { backgroundColor: C.scarlet } : c.followUp?.status === "sent" ? { backgroundColor: C.wash } : null]}>
              <Text style={[s.chipText, urgent && { color: "#fff" }]}>{chip}</Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  section: { color: C.ink, fontSize: 20, fontWeight: "700", marginTop: 8 },
  empty: { borderWidth: 1, borderStyle: "dashed", borderColor: C.line, borderRadius: 16, padding: 24 },
  emptyText: { color: C.ink2, textAlign: "center", fontSize: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.card, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, padding: 16 },
  who: { color: C.ink, fontSize: 16, fontWeight: "600" },
  meta: { color: C.ink2, fontSize: 12, marginTop: 2 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: C.scarletTint },
  chipText: { color: C.scarletBright, fontSize: 12, fontWeight: "600" },
});

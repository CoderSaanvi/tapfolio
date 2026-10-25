import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorText, H1, Sub } from "@/components/ui";
import { api } from "@/lib/api";
import { dueLabel, isDue } from "@/lib/followup";
import { C } from "@/lib/theme";
import type { Conversation } from "@/lib/types";

/** Every conversation, follow-ups due first. Pull to refresh. */
export default function Activity() {
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<Conversation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await api<Conversation[]>("/api/conversations");
      setItems([...list].sort((a, b) => Number(Boolean(b.followUp && isDue(b.followUp))) - Number(Boolean(a.followUp && isDue(a.followUp)))));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load activity.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.night }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 120, gap: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={C.ink2} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      <H1>Activity</H1>
      <Sub>Your conversations and follow-ups.</Sub>
      <ErrorText>{error}</ErrorText>
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
  empty: { borderWidth: 1, borderStyle: "dashed", borderColor: C.line, borderRadius: 16, padding: 24 },
  emptyText: { color: C.ink2, textAlign: "center", fontSize: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.card, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, padding: 16 },
  who: { color: C.ink, fontSize: 16, fontWeight: "600" },
  meta: { color: C.ink2, fontSize: 12, marginTop: 2 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: C.scarletTint },
  chipText: { color: C.scarletBright, fontSize: 12, fontWeight: "600" },
});

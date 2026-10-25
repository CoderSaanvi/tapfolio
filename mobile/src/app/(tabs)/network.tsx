import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorText, H1, Sub } from "@/components/ui";
import { api } from "@/lib/api";
import { C } from "@/lib/theme";
import type { Contact } from "@/lib/types";

function initials(c: Contact): string {
  const source = c.name || c.company || c.email;
  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function metLabel(iso: string): string {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Everyone you've met: name, company, role, email, and where. Tap for the conversation; ✉ to email. */
export default function Network() {
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setContacts(await api<Contact[]>("/api/contacts"));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your network.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !contacts) return contacts ?? [];
    return contacts.filter((c) => [c.name, c.company, c.role, c.email, ...c.events, c.notes].join(" ").toLowerCase().includes(q));
  }, [contacts, query]);

  const companies = new Set((contacts ?? []).map((c) => c.company.toLowerCase()).filter(Boolean)).size;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.night }}
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 120, gap: 12 }}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} tintColor={C.ink2} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
    >
      <H1>Network</H1>
      <Sub>
        {contacts ? `${contacts.length} ${contacts.length === 1 ? "person" : "people"}${companies ? ` · ${companies} ${companies === 1 ? "company" : "companies"}` : ""}` : "Everyone you've talked to."}
      </Sub>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search name, company, event…"
        placeholderTextColor="rgba(154,159,163,0.6)"
        keyboardAppearance="dark"
        autoCapitalize="none"
        style={s.search}
      />
      <ErrorText>{error}</ErrorText>

      {contacts?.length === 0 && (
        <View style={s.empty}>
          <Text style={s.emptyText}>People show up here once you add their name or email to a conversation.</Text>
        </View>
      )}
      {contacts && contacts.length > 0 && shown.length === 0 && <Text style={s.emptyText}>No one matches “{query}”.</Text>}

      {shown.map((c) => {
        const where = [c.company, c.role].filter(Boolean).join(" · ");
        const chip = c.followUp?.status === "sent" ? "Followed up" : c.followUp ? "Draft ready" : "Follow up";
        return (
          <Pressable key={c.id} onPress={() => router.push({ pathname: "/conversation/[id]", params: { id: c.latestConversationId } })} style={s.row}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials(c)}</Text>
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={s.who} numberOfLines={1}>{c.name || c.email || c.company}</Text>
              {where ? <Text style={s.meta} numberOfLines={1}>{where}</Text> : null}
              <Text style={s.meta} numberOfLines={1}>
                {c.events[0] ? `${c.events[0]} · ` : ""}
                {metLabel(c.lastMetAt)}
                {c.conversationIds.length > 1 ? ` · met ${c.conversationIds.length}×` : ""}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 6 }}>
              <View style={[s.chip, c.followUp?.status === "sent" && { backgroundColor: C.wash }]}>
                <Text style={[s.chipText, c.followUp?.status === "sent" && { color: C.ink2 }]}>{chip}</Text>
              </View>
              {c.email ? (
                <Pressable onPress={() => Linking.openURL(`mailto:${c.email}`)} hitSlop={8} style={s.mail}>
                  <Text style={{ color: C.ink, fontSize: 13 }}>✉ Email</Text>
                </Pressable>
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  search: { backgroundColor: C.wash, color: C.ink, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  empty: { borderWidth: 1, borderStyle: "dashed", borderColor: C.line, borderRadius: 16, padding: 24 },
  emptyText: { color: C.ink2, textAlign: "center", fontSize: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: C.card, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, padding: 14 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.scarletTint, alignItems: "center", justifyContent: "center" },
  avatarText: { color: C.scarletBright, fontWeight: "700", fontSize: 14 },
  who: { color: C.ink, fontSize: 16, fontWeight: "600" },
  meta: { color: C.ink2, fontSize: 12, marginTop: 2 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: C.scarletTint },
  chipText: { color: C.scarletBright, fontSize: 11, fontWeight: "600" },
  mail: { borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, backgroundColor: C.wash, paddingHorizontal: 10, paddingVertical: 4 },
});

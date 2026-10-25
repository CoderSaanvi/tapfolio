import { StyleSheet, Text, View } from "react-native";
import { Card, Label } from "@/components/ui";
import { C } from "@/lib/theme";
import type { Insights, InsightItem } from "@/lib/types";

export function formatMs(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
}

function Bars({ title, items, empty }: { title: string; items: InsightItem[]; empty: string }) {
  const max = items[0]?.ms ?? 1;
  return (
    <View style={{ gap: 8 }}>
      <Label>{title}</Label>
      {items.length === 0 ? (
        <Text style={s.empty}>{empty}</Text>
      ) : (
        items.map((it, i) => (
          <View key={it.target} style={{ gap: 4 }}>
            <View style={s.rowHead}>
              <Text style={s.rowLabel} numberOfLines={1}>
                <Text style={s.rank}>{String(i + 1).padStart(2, "0")}  </Text>
                {it.label}
              </Text>
              <Text style={s.rowMeta}>
                {formatMs(it.ms)} · {it.sessions}
              </Text>
            </View>
            <View style={s.track}>
              <View style={[s.fill, { width: `${Math.max(4, (it.ms / max) * 100)}%` }]} />
            </View>
          </View>
        ))
      )}
    </View>
  );
}

/** What recruiters looked at most: opens, viewers, average time, then the top projects and sections. */
export function InsightsPanel({ insights: i }: { insights: Insights }) {
  const stats = [
    { value: String(i.views), label: "opens" },
    { value: String(i.viewers), label: "viewers" },
    { value: formatMs(i.avgMs), label: "avg. time" },
  ];
  const known = i.audience.recruiter + i.audience.student;

  return (
    <Card accent style={{ gap: 16 }}>
      <Text style={s.title}>What they looked at</Text>
      <View style={s.stats}>
        {stats.map((st) => (
          <View key={st.label} style={s.stat}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>
      <Bars title="Most looked-at projects" items={i.topProjects.slice(0, 3)} empty="No one has reached a project yet." />
      <Bars title="Most looked-at sections" items={i.topSections.slice(0, 3)} empty="No section views yet." />
      {(i.openedVia.length > 0 || i.topClicks.length > 0) && (
        <View style={s.chips}>
          {i.openedVia.map((v) => (
            <Text key={v.label} style={s.chip}>
              {v.count}× {v.label}
            </Text>
          ))}
          {known > 0 && (
            <Text style={s.chip}>
              {i.audience.recruiter} recruiters · {i.audience.student} students
            </Text>
          )}
          {i.topClicks.slice(0, 4).map((c) => (
            <Text key={c.target} style={[s.chip, s.chipHot]}>
              {c.count}× {c.label}
            </Text>
          ))}
        </View>
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  title: { color: C.ink, fontSize: 16, fontWeight: "600" },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, backgroundColor: C.wash, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  statValue: { color: C.scarletBright, fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] },
  statLabel: { color: C.ink2, fontSize: 11, marginTop: 2 },
  rowHead: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  rowLabel: { color: C.ink, fontSize: 14, flex: 1 },
  rank: { color: C.scarletBright, fontFamily: "Menlo", fontSize: 11 },
  rowMeta: { color: C.ink2, fontSize: 11, fontFamily: "Menlo" },
  track: { height: 6, borderRadius: 3, backgroundColor: C.wash },
  fill: { height: 6, borderRadius: 3, backgroundColor: C.scarlet },
  empty: { color: C.ink2, fontSize: 13 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { color: C.ink2, fontSize: 12, backgroundColor: C.wash, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, overflow: "hidden" },
  chipHot: { color: C.scarletBright, backgroundColor: C.scarletTint },
});

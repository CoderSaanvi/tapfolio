import { StyleSheet, Text, useWindowDimensions, View } from "react-native";
import Svg, { Circle, G, Rect, Text as SvgText } from "react-native-svg";
import { Card, Label } from "@/components/ui";
import { C } from "@/lib/theme";
import type { Insights, InsightItem } from "@/lib/types";

export function formatMs(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return s % 60 ? `${m}m ${s % 60}s` : `${m}m`;
}

/** One shade per slice/bar, scarlet first so the top item pops. */
const PALETTE = ["#E0203D", "#F06A7E", "#B8142E", "#F7A6B2", "#7A0F20", "#5c5f63"];

function short(label: string, max = 11): string {
  const first = label.split(/[\s–:-]+/)[0] ?? label;
  return first.length > max ? `${first.slice(0, max - 1)}…` : first;
}

/** Vertical bars: time spent on each of the top projects. */
function BarChart({ items, width }: { items: InsightItem[]; width: number }) {
  const h = 150;
  const top = 22;
  const bottom = 26;
  const n = items.length;
  const gap = 12;
  const bw = Math.min(56, (width - gap * (n + 1)) / n);
  const max = items[0]?.ms ?? 1;
  return (
    <Svg width={width} height={h}>
      {items.map((it, i) => {
        const bh = Math.max(4, ((h - top - bottom) * it.ms) / max);
        const x = gap + i * (bw + gap);
        const y = h - bottom - bh;
        return (
          <G key={it.target}>
            <Rect x={x} y={y} width={bw} height={bh} rx={8} fill={PALETTE[i % PALETTE.length]} />
            <SvgText x={x + bw / 2} y={y - 6} fontSize={11} fill={C.ink} textAnchor="middle" fontFamily="Menlo">
              {formatMs(it.ms)}
            </SvgText>
            <SvgText x={x + bw / 2} y={h - 8} fontSize={11} fill={C.ink2} textAnchor="middle">
              {short(it.label)}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

/** Donut: share of viewing time across sections, legend beside it. */
function Donut({ items, total }: { items: InsightItem[]; total: number }) {
  const size = 132;
  const stroke = 26;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 18 }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={C.wash} strokeWidth={stroke} fill="none" />
        {items.map((it, i) => {
          const len = (it.ms / total) * circ;
          const el = (
            <Circle
              key={it.target}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={PALETTE[i % PALETTE.length]}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
          offset += len;
          return el;
        })}
        <SvgText x={size / 2} y={size / 2 + 5} fontSize={14} fontWeight="700" fill={C.ink} textAnchor="middle">
          {formatMs(total)}
        </SvgText>
      </Svg>
      <View style={{ flex: 1, gap: 7 }}>
        {items.map((it, i) => (
          <View key={it.target} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: PALETTE[i % PALETTE.length] }} />
            <Text style={s.legend} numberOfLines={1}>
              {it.label}
            </Text>
            <Text style={s.legendPct}>{Math.round((it.ms / total) * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Broad strokes of who looked and what held them: three numbers, a bar chart, a donut, one line of context. */
export function InsightsPanel({ insights: i }: { insights: Insights }) {
  const { width } = useWindowDimensions();
  const chartWidth = width - 40 - 32; // screen padding + card padding
  const stats = [
    { value: String(i.views), label: "opens" },
    { value: String(i.viewers), label: "viewers" },
    { value: formatMs(i.avgMs), label: "avg. visit" },
  ];
  const projects = i.topProjects.slice(0, 4);
  const sections = i.topSections.slice(0, 5);
  const sectionTotal = sections.reduce((a, b) => a + b.ms, 0);
  const via = i.openedVia.map((v) => `${v.count} ${v.label}`).join(" · ");
  const topTap = i.topClicks[0];

  return (
    <Card accent style={{ gap: 18 }}>
      <View style={s.stats}>
        {stats.map((st) => (
          <View key={st.label} style={s.stat}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 6 }}>
        <Label>Time on each project</Label>
        {projects.length ? <BarChart items={projects} width={chartWidth} /> : <Text style={s.empty}>No one has reached a project yet.</Text>}
      </View>

      <View style={{ gap: 10 }}>
        <Label>Where the time goes</Label>
        {sectionTotal > 0 ? <Donut items={sections} total={sectionTotal} /> : <Text style={s.empty}>No section views yet.</Text>}
      </View>

      {Boolean(via || topTap || i.leftInfo) && (
        <Text style={s.foot}>
          {[via ? `Opened via ${via}` : "", topTap ? `Most tapped: ${topTap.label.replace(/^Tapped /, "")}` : "", i.leftInfo ? `${i.leftInfo} left their info` : ""]
            .filter(Boolean)
            .join("  ·  ")}
        </Text>
      )}
    </Card>
  );
}

const s = StyleSheet.create({
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, backgroundColor: C.wash, borderRadius: 14, paddingVertical: 12, alignItems: "center" },
  statValue: { color: C.scarletBright, fontSize: 22, fontWeight: "800", fontVariant: ["tabular-nums"] },
  statLabel: { color: C.ink2, fontSize: 11, marginTop: 2 },
  legend: { color: C.ink, fontSize: 13, flex: 1 },
  legendPct: { color: C.ink2, fontSize: 12, fontFamily: "Menlo" },
  empty: { color: C.ink2, fontSize: 13 },
  foot: { color: C.ink2, fontSize: 12, lineHeight: 17 },
});

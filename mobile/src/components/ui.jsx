import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { C, R } from "@/lib/theme";

/** Dark, scrollable, safe-area-aware page. `footer` stays pinned above the home indicator. */
export function Screen({ children, footer, padTop = true }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.night }}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingTop: padTop ? insets.top + 12 : 12, paddingBottom: (footer ? 120 : 40) + insets.bottom, gap: 14 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {children}
      </ScrollView>
      {footer && <View style={[s.footer, { paddingBottom: Math.max(16, insets.bottom) }]}>{footer}</View>}
    </View>
  );
}

export function H1({ children }) {
  return <Text style={s.h1}>{children}</Text>;
}

export function Sub({ children, style }) {
  return <Text style={[s.sub, style]}>{children}</Text>;
}

export function Label({ children }) {
  return <Text style={s.label}>{children}</Text>;
}

export function Card({ children, style, accent }) {
  return <View style={[s.card, accent && s.cardAccent, style]}>{children}</View>;
}

export function Button({ title, onPress, kind = "primary", disabled, loading }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        kind === "secondary" && s.btnSecondary,
        kind === "ghost" && s.btnGhost,
        (disabled || loading) && { opacity: 0.45 },
        pressed && { opacity: 0.8 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={[s.btnText, kind !== "primary" && { color: kind === "ghost" ? C.scarletBright : C.ink }]}>{title}</Text>
      )}
    </Pressable>
  );
}

/** Labeled input; 16pt text so iOS never zooms. */
export function Field({ label, ...props }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor="rgba(154,159,163,0.6)"
        keyboardAppearance="dark"
        {...props}
        style={[s.input, props.multiline && { minHeight: 72, textAlignVertical: "top" }, props.style]}
      />
    </View>
  );
}

export function ErrorText({ children }) {
  return children ? <Text style={{ color: C.scarletBright, fontSize: 13 }}>{children}</Text> : null;
}

const s = StyleSheet.create({
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: "rgba(10,10,10,0.94)",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.line,
  },
  h1: { color: C.ink, fontSize: 28, fontWeight: "700", letterSpacing: -0.5, lineHeight: 33 },
  sub: { color: C.ink2, fontSize: 15, lineHeight: 21 },
  label: { color: C.ink2, fontSize: 11, letterSpacing: 1.6, textTransform: "uppercase", fontFamily: "Menlo" },
  card: { backgroundColor: C.card, borderRadius: R.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line, padding: 16, gap: 10 },
  cardAccent: { borderTopWidth: 3, borderTopColor: C.scarlet, borderRadius: R.xl },
  btn: { backgroundColor: C.scarlet, borderRadius: 16, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  btnSecondary: { backgroundColor: C.wash, borderWidth: StyleSheet.hairlineWidth, borderColor: C.line },
  btnGhost: { backgroundColor: "transparent", paddingVertical: 10 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  fieldLabel: { color: C.ink, fontSize: 14, fontWeight: "500" },
  input: {
    backgroundColor: C.wash,
    color: C.ink,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
});

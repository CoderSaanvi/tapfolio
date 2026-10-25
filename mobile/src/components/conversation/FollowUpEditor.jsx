import * as MailComposer from "expo-mail-composer";
import { useState } from "react";
import { Linking, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card, ErrorText, Label } from "@/components/ui";
import { dueLabel } from "@/lib/followup";
import { C } from "@/lib/theme";

function shiftDate(iso, days) {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** The Claude draft: edit, change the send date, then send from the native Mail sheet. */
export function FollowUpEditor({ convo, drafting, onDraft, onSave }) {
  const f = convo.followUp;
  const [subject, setSubject] = useState(f?.subject ?? "");
  const [body, setBody] = useState(f?.body ?? "");
  const [error, setError] = useState(null);
  if (f && subject === "" && body === "") {
    setSubject(f.subject);
    setBody(f.body);
  }

  async function send() {
    setError(null);
    try {
      await onSave({ subject, body });
      if (await MailComposer.isAvailableAsync()) {
        const r = await MailComposer.composeAsync({ recipients: convo.recruiter.email ? [convo.recruiter.email] : [], subject, body });
        if (r.status === MailComposer.MailComposerStatus.SENT) await onSave({ status: "sent" });
      } else {
        // No Mail account set up: fall back to any mail app via mailto.
        await Linking.openURL(`mailto:${encodeURIComponent(convo.recruiter.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      }
    } catch {
      setError("Couldn't open Mail. Copy the text instead.");
    }
  }

  if (!f) {
    return (
      <Card accent>
        <Label>Follow-up</Label>
        <Text style={s.sub}>
          Claude reads the transcript, your notes, and what they looked at on your card, then drafts an email to send in a couple of days.
        </Text>
        <Button title={drafting ? "Drafting with Claude…" : "Draft follow-up"} onPress={onDraft} loading={drafting} />
      </Card>
    );
  }

  return (
    <Card accent>
      <View style={s.head}>
        <Label>Follow-up</Label>
        <Text style={s.chip}>{dueLabel(f)}</Text>
      </View>
      <TextInput
        value={subject}
        onChangeText={setSubject}
        onBlur={() => onSave({ subject })}
        style={[s.input, { fontWeight: "600" }]}
        keyboardAppearance="dark"
      />
      <TextInput
        value={body}
        onChangeText={setBody}
        onBlur={() => onSave({ body })}
        multiline
        style={[s.input, { minHeight: 220, textAlignVertical: "top" }]}
        keyboardAppearance="dark"
      />
      <View style={s.dateRow}>
        <Text style={s.sub}>
          Send on {new Date(`${f.sendOn}T12:00:00`).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
        </Text>
        <View style={{ flexDirection: "row", gap: 6 }}>
          <Text style={s.step} onPress={() => onSave({ sendOn: shiftDate(f.sendOn, -1) })}>
            −1 day
          </Text>
          <Text style={s.step} onPress={() => onSave({ sendOn: shiftDate(f.sendOn, 1) })}>
            +1 day
          </Text>
        </View>
      </View>
      {f.highlights.map((h) => (
        <Text key={h} style={s.highlight}>
          • {h}
        </Text>
      ))}
      <Button title={f.status === "sent" ? "Send again" : "Send from Mail"} onPress={send} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Button
            title={f.status === "sent" ? "Mark not sent" : "Mark sent"}
            kind="secondary"
            onPress={() => onSave({ status: f.status === "sent" ? "draft" : "sent" })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button title={drafting ? "Drafting…" : "Redraft"} kind="secondary" onPress={onDraft} loading={drafting} />
        </View>
      </View>
      <ErrorText>{error}</ErrorText>
    </Card>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chip: {
    color: C.scarletBright,
    backgroundColor: C.scarletTint,
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  sub: { color: C.ink2, fontSize: 14, lineHeight: 20 },
  input: {
    backgroundColor: C.wash,
    color: C.ink,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 22,
  },
  dateRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  step: { color: C.scarletBright, fontSize: 13, paddingHorizontal: 8, paddingVertical: 4 },
  highlight: { color: C.ink2, fontSize: 13, lineHeight: 18 },
});

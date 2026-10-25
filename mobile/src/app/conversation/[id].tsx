import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { FollowUpEditor } from "@/components/conversation/FollowUpEditor";
import { ViewsList } from "@/components/conversation/ViewsList";
import { ShareBlock } from "@/components/ShareBlock";
import { Button, Card, ErrorText, Field, Label, Screen } from "@/components/ui";
import { api, API_URL } from "@/lib/api";
import { scheduleFollowUpReminder } from "@/lib/reminders";
import { useSession } from "@/lib/session";
import { C } from "@/lib/theme";
import type { Conversation, ViewSession } from "@/lib/types";

const AUTOSAVE_MS = 10_000;

interface Detail {
  conversation: Conversation;
  sessions: ViewSession[];
}

const fetchDetail = (id: string) => api<Detail>(`/api/conversations/${id}`);

/** Live (sharing + dictated notes) until ended, then review: recruiter, follow-up, transcript, views. */
export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useSession();
  const [convo, setConvo] = useState<Conversation | null>(null);
  const [sessions, setSessions] = useState<ViewSession[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef<Conversation | null>(null);
  useEffect(() => {
    latest.current = convo;
  }, [convo]);

  const applyLoaded = useCallback((d: Detail) => {
    setConvo(d.conversation);
    setSessions(d.sessions);
  }, []);
  const load = useCallback(async () => {
    try {
      applyLoaded(await fetchDetail(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load.");
    }
  }, [id, applyLoaded]);

  useEffect(() => {
    let alive = true;
    fetchDetail(id)
      .then((d) => alive && applyLoaded(d))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : "Couldn't load."));
    return () => {
      alive = false;
    };
  }, [id, applyLoaded]);

  const patch = useCallback(
    async (body: Record<string, unknown>) => {
      try {
        const next = await api<Conversation>(`/api/conversations/${id}`, { method: "PATCH", body });
        setConvo(next);
        if (body.followUp) void scheduleFollowUpReminder(next);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Couldn't save.");
      }
    },
    [id],
  );

  // While live, save the transcript and notes every few seconds so nothing is lost.
  const live = Boolean(convo && !convo.endedAt);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      const c = latest.current;
      if (c) void patch({ transcript: c.transcript, notes: c.notes });
    }, AUTOSAVE_MS);
    return () => clearInterval(t);
  }, [live, patch]);

  async function draft() {
    if (!convo) return;
    setDrafting(true);
    await patch({ transcript: convo.transcript, notes: convo.notes, recruiter: convo.recruiter });
    try {
      const next = await api<Conversation>(`/api/conversations/${id}/draft`, { method: "POST" });
      setConvo(next);
      void scheduleFollowUpReminder(next);
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't draft right now.");
    } finally {
      setDrafting(false);
    }
  }

  if (!convo || !profile) return <Screen padTop={false}>{error ? <ErrorText>{error}</ErrorText> : <Text style={{ color: C.ink2 }}>Loading…</Text>}</Screen>;

  const set = (fields: Partial<Conversation>) => setConvo({ ...convo, ...fields });
  const cardUrl = `${API_URL}/c/${profile.slug}?c=${convo.id}${convo.eventName ? `&ev=${encodeURIComponent(convo.eventName)}` : ""}`;

  return (
    <Screen padTop={false} footer={live ? <Button title="End & review" onPress={() => patch({ transcript: convo.transcript, notes: convo.notes, end: true })} /> : undefined}>
      <ErrorText>{error}</ErrorText>
      {live && <ShareBlock url={cardUrl} name={`${profile.firstName} ${profile.lastName}`} />}
      {!live && <FollowUpEditor convo={convo} drafting={drafting} onDraft={draft} onSave={(f) => patch({ followUp: f })} />}

      <Card>
        <Label>Who you met</Label>
        <Field label="Name" value={convo.recruiter.name} onChangeText={(v) => set({ recruiter: { ...convo.recruiter, name: v } })} onBlur={() => patch({ recruiter: convo.recruiter })} placeholder="Claude fills this from the transcript" />
        <Field label="Company" value={convo.recruiter.company} onChangeText={(v) => set({ recruiter: { ...convo.recruiter, company: v } })} onBlur={() => patch({ recruiter: convo.recruiter })} />
        <Field label="Email" value={convo.recruiter.email} onChangeText={(v) => set({ recruiter: { ...convo.recruiter, email: v } })} onBlur={() => patch({ recruiter: convo.recruiter })} keyboardType="email-address" autoCapitalize="none" placeholder="From their badge or card" />
      </Card>

      <Card>
        <Label>The conversation</Label>
        {live && <Text style={{ color: C.ink2, fontSize: 12 }}>Tap the 🎙 on the keyboard to dictate as you talk. Saves every few seconds.</Text>}
        <Field label="Transcript" value={convo.transcript} onChangeText={(v) => set({ transcript: v })} onBlur={() => patch({ transcript: convo.transcript })} multiline placeholder="What you talked about" />
        <Field label="Your notes" value={convo.notes} onChangeText={(v) => set({ notes: v })} onBlur={() => patch({ notes: convo.notes })} multiline placeholder="e.g. Apply by Nov 15, email her after" />
      </Card>

      {!live && <ViewsList sessions={sessions} />}
      <View style={{ height: 8 }} />
    </Screen>
  );
}

"use client";

import { useState } from "react";
import { patchConversation, requestDraft } from "@/lib/conversation-client";
import type { Conversation, FollowUp } from "@/lib/types";
import { FollowUpPanel } from "./FollowUpPanel";
import { RecruiterFields } from "./RecruiterFields";
import { TranscriptEditor } from "./TranscriptEditor";

interface ConversationEditorProps {
  initial: Conversation;
}

export function ConversationEditor({ initial }: ConversationEditorProps) {
  const [convo, setConvo] = useState(initial);
  const [drafting, setDrafting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function save(patch: Record<string, unknown>) {
    try {
      setConvo(await patchConversation(convo.id, patch));
      setStatus(null);
    } catch {
      setStatus("Couldn't save. Check your connection.");
    }
  }

  async function draft() {
    setDrafting(true);
    setStatus(null);
    try {
      // Save the latest edits first so Claude drafts from them.
      await patchConversation(convo.id, { transcript: convo.transcript, notes: convo.notes, recruiter: convo.recruiter });
      setConvo(await requestDraft(convo.id));
    } catch {
      setStatus("Couldn't draft right now. Try again in a moment.");
    } finally {
      setDrafting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {status && <p className="rounded-xl bg-scarlet-tint p-3 text-sm text-scarlet-bright">{status}</p>}
      <FollowUpPanel
        followUp={convo.followUp}
        email={convo.recruiter.email}
        drafting={drafting}
        onDraft={draft}
        onChange={(f: FollowUp) => setConvo({ ...convo, followUp: f })}
        onSave={(patch) => save({ followUp: patch })}
      />
      <RecruiterFields
        value={convo.recruiter}
        onChange={(recruiter) => setConvo({ ...convo, recruiter })}
        onSave={() => save({ recruiter: convo.recruiter })}
      />
      <TranscriptEditor
        transcript={convo.transcript}
        notes={convo.notes}
        onChange={(v) => setConvo({ ...convo, ...v })}
        onSave={() => save({ transcript: convo.transcript, notes: convo.notes })}
      />
    </div>
  );
}

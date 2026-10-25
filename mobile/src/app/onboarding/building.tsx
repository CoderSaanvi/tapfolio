import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui";
import { api, uploadFile } from "@/lib/api";
import { useOnboarding, type PickedFile } from "@/lib/onboarding";
import { useSession } from "@/lib/session";
import { C } from "@/lib/theme";
import type { OnboardingAnswers } from "@/lib/types";

const STEPS = ["Uploading your photo and resume", "Reading your resume", "Picking your strongest projects", "Writing your bio", "Designing your contact card"];

/** Uploads both files, then has the backend (Claude) build the card. Returns the owner token. */
async function createCard(photo: PickedFile, resume: PickedFile, answers: OnboardingAnswers, onUploaded: () => void): Promise<string> {
  const [photoUrl, resumeUrl] = await Promise.all([uploadFile(photo.uri, photo.mimeType), uploadFile(resume.uri, resume.mimeType)]);
  onUploaded();
  const { ownerToken } = await api<{ slug: string; ownerToken: string }>("/api/onboarding", { method: "POST", body: { photoUrl, resumeUrl, answers } });
  return ownerToken;
}

/** Builds the card and signs this phone in as its owner, then goes to the optional demos step. */
export default function Building() {
  const { photo, resume, answers } = useOnboarding();
  const { signIn } = useSession();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const running = useRef(false);

  useEffect(() => {
    if (!photo || !resume) {
      router.replace("/onboarding/upload");
      return;
    }
    if (running.current) return;
    running.current = true;
    createCard(photo, resume, answers, () => setStep(1))
      .then(signIn)
      .then(() => router.replace({ pathname: "/demos", params: { new: "1" } }))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Something went wrong building your card."))
      .finally(() => {
        running.current = false;
      });
    // Re-run only on "Try again" (attempt); answers are fixed once building starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  function retry() {
    setError(null);
    setStep(0);
    setAttempt((n) => n + 1);
  }

  // Claude takes ~30-60s; advance the checklist so the wait feels alive.
  useEffect(() => {
    if (error || step === 0) return;
    const t = setInterval(() => setStep((n) => Math.min(n + 1, STEPS.length - 1)), 9000);
    return () => clearInterval(t);
  }, [error, step]);

  return (
    <View style={s.wrap}>
      {error ? (
        <>
          <Text style={s.title}>That didn&apos;t work</Text>
          <Text style={s.sub}>{error}</Text>
          <View style={{ alignSelf: "stretch" }}>
            <Button title="Try again" onPress={retry} />
          </View>
          <Button title="Back" kind="ghost" onPress={() => router.back()} />
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={C.scarletBright} />
          <Text style={s.title}>Building your Tapfolio</Text>
          <View style={{ gap: 8 }}>
            {STEPS.map((t, i) => (
              <Text key={t} style={{ color: i < step ? C.ink : i === step ? C.scarletBright : "rgba(154,159,163,0.5)", fontSize: 14 }}>
                {i < step ? "✓  " : i === step ? "•  " : "    "}
                {t}
              </Text>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.night, alignItems: "center", justifyContent: "center", gap: 22, padding: 28 },
  title: { color: C.ink, fontSize: 24, fontWeight: "700", textAlign: "center" },
  sub: { color: C.ink2, fontSize: 15, textAlign: "center" },
});

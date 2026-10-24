"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resizeImage } from "@/lib/resize-image";
import type { OnboardingAnswers } from "@/lib/profile-schema";
import { BuildingStep } from "./BuildingStep";
import { QuestionsStep } from "./QuestionsStep";
import { StepShell, primaryButton } from "./StepShell";
import { UploadStep } from "./UploadStep";

const EMPTY: OnboardingAnswers = { displayName: "", pronouns: "", email: "", phone: "", linkedin: "", github: "", targetRoles: "", building: "", tagline: "" };

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<"welcome" | "upload" | "questions" | "building">("welcome");
  const [photo, setPhoto] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [answers, setAnswers] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  async function build() {
    if (!photo || !resume) return;
    setStep("building");
    setError(null);
    try {
      const form = new FormData();
      form.append("photo", await resizeImage(photo));
      form.append("resume", resume);
      form.append("answers", JSON.stringify(answers));
      const res = await fetch("/api/onboarding", { method: "POST", body: form });
      const json = (await res.json()) as { success: boolean; data?: { slug: string }; error?: string };
      if (!json.success || !json.data) throw new Error(json.error ?? "Something went wrong building your card.");
      router.replace("/onboarding/demos?new=1");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong building your card.");
    }
  }

  if (step === "building") return <BuildingStep error={error} onRetry={build} />;

  if (step === "welcome") {
    return (
      <StepShell
        step={0}
        total={4}
        title="Your resume, as a card recruiters remember"
        sub="Upload your resume and a photo. Tapfolio builds your contact card and live portfolio, ready to share with a tap."
        footer={<button type="button" onClick={() => setStep("upload")} className={primaryButton}>Get started</button>}
      >
        <ul className="flex flex-col gap-3 text-[15px]">
          {["Tap phones or show a QR to share", "Recruiters see your projects, not just a PDF", "Claude drafts your follow-up email after"].map((t) => (
            <li key={t} className="flex items-center gap-3 rounded-2xl border border-line bg-card px-4 py-3.5">
              <span className="h-2 w-2 flex-none rounded-full bg-scarlet-bright" /> {t}
            </li>
          ))}
        </ul>
        <Link href="/c/kaushik" className="text-center text-sm text-ink-2 underline-offset-4">See an example card</Link>
      </StepShell>
    );
  }

  if (step === "upload") {
    return (
      <StepShell
        step={1}
        total={4}
        title="Add your photo and resume"
        onBack={() => setStep("welcome")}
        footer={<button type="button" disabled={!photo || !resume} onClick={() => setStep("questions")} className={primaryButton}>Continue</button>}
      >
        <UploadStep photo={photo} resume={resume} onPhoto={setPhoto} onResume={setResume} />
      </StepShell>
    );
  }

  return (
    <StepShell
      step={2}
      total={4}
      title="A few quick questions"
      sub="All optional. Your answers shape how the portfolio is written."
      onBack={() => setStep("upload")}
      footer={<button type="button" onClick={build} className={primaryButton}>Build my Tapfolio</button>}
    >
      <QuestionsStep answers={answers} onChange={setAnswers} />
    </StepShell>
  );
}

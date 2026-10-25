import { createContext, useContext, useState, type ReactNode } from "react";
import type { OnboardingAnswers } from "./types";

export interface PickedFile {
  uri: string;
  mimeType: string;
  name?: string;
}

interface OnboardingState {
  photo: PickedFile | null;
  resume: PickedFile | null;
  answers: OnboardingAnswers;
  setPhoto: (f: PickedFile | null) => void;
  setResume: (f: PickedFile | null) => void;
  setAnswers: (a: OnboardingAnswers) => void;
}

const EMPTY: OnboardingAnswers = { displayName: "", pronouns: "", email: "", phone: "", linkedin: "", github: "", targetRoles: "", building: "", tagline: "" };

const Ctx = createContext<OnboardingState | null>(null);

/** Holds the onboarding answers across its screens until "Build my Tapfolio". */
export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [photo, setPhoto] = useState<PickedFile | null>(null);
  const [resume, setResume] = useState<PickedFile | null>(null);
  const [answers, setAnswers] = useState(EMPTY);
  return <Ctx.Provider value={{ photo, resume, answers, setPhoto, setResume, setAnswers }}>{children}</Ctx.Provider>;
}

export function useOnboarding(): OnboardingState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return v;
}

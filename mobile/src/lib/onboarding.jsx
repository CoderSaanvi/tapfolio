import { createContext, useContext, useState } from "react";

const EMPTY = { displayName: "", pronouns: "", email: "", phone: "", linkedin: "", github: "", targetRoles: "", building: "", tagline: "" };

const Ctx = createContext(null);

/** Holds the onboarding answers across its screens until "Build my Tapfolio". */
export function OnboardingProvider({ children }) {
  const [photo, setPhoto] = useState(null);
  const [resume, setResume] = useState(null);
  const [answers, setAnswers] = useState(EMPTY);
  return <Ctx.Provider value={{ photo, resume, answers, setPhoto, setResume, setAnswers }}>{children}</Ctx.Provider>;
}

export function useOnboarding() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return v;
}

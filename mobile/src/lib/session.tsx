import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiError, tokenStore } from "./api";
import type { Profile } from "./types";

interface Session {
  /** "loading" until we know whether this phone owns a card. */
  status: "loading" | "signedOut" | "signedIn";
  profile: Profile | null;
  error: string | null;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setProfile: (p: Profile) => void;
}

const SessionContext = createContext<Session | null>(null);

interface Resolved {
  status: "signedOut" | "signedIn";
  profile: Profile | null;
  error: string | null;
}

/** Works out whether this phone owns a card, without touching React state. */
async function resolveSession(): Promise<Resolved> {
  const token = await tokenStore.get();
  if (!token) return { status: "signedOut", profile: null, error: null };
  try {
    return { status: "signedIn", profile: await api<Profile>("/api/profile/me"), error: null };
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      await tokenStore.clear();
      return { status: "signedOut", profile: null, error: null };
    }
    // Offline or server down: keep the token, show the error, let them retry.
    return { status: "signedIn", profile: null, error: e instanceof Error ? e.message : "Couldn't load your card." };
  }
}

/** Which card this phone owns (via the token from onboarding), loaded once at launch. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Session["status"]>("loading");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((r: Resolved) => {
    setStatus(r.status);
    setProfile(r.profile);
    setError(r.error);
  }, []);

  const refresh = useCallback(async () => apply(await resolveSession()), [apply]);

  useEffect(() => {
    let alive = true;
    resolveSession().then((r) => alive && apply(r));
    return () => {
      alive = false;
    };
  }, [apply]);

  const signIn = useCallback(
    async (token: string) => {
      await tokenStore.set(token);
      await refresh();
    },
    [refresh],
  );

  const signOut = useCallback(async () => {
    await tokenStore.clear();
    setProfile(null);
    setStatus("signedOut");
  }, []);

  return (
    <SessionContext.Provider value={{ status, profile, error, signIn, signOut, refresh, setProfile }}>{children}</SessionContext.Provider>
  );
}

export function useSession(): Session {
  const s = useContext(SessionContext);
  if (!s) throw new Error("useSession must be used inside SessionProvider");
  return s;
}

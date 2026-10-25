import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, ApiError, tokenStore } from "./api";

const SessionContext = createContext(null);

/** Works out whether this phone owns a card, without touching React state. */
async function resolveSession() {
  const token = await tokenStore.get();
  if (!token) return { status: "signedOut", profile: null, error: null };
  try {
    return { status: "signedIn", profile: await api("/api/profile/me"), error: null };
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
export function SessionProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const apply = useCallback((r) => {
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
    async (token) => {
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

  return <SessionContext.Provider value={{ status, profile, error, signIn, signOut, refresh, setProfile }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const s = useContext(SessionContext);
  if (!s) throw new Error("useSession must be used inside SessionProvider");
  return s;
}

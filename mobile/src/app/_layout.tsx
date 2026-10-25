import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SessionProvider, useSession } from "@/lib/session";
import { C } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

const theme = { ...DarkTheme, colors: { ...DarkTheme.colors, background: C.night, card: C.night, primary: C.scarletBright, text: C.ink, border: C.line } };

function Navigator() {
  const { status } = useSession();
  useEffect(() => {
    if (status !== "loading") SplashScreen.hideAsync();
  }, [status]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.night } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="conversation/[id]" options={{ headerShown: true, title: "Conversation", headerBackTitle: "Back", headerTintColor: C.scarletBright }} />
      <Stack.Screen name="demos" options={{ headerShown: true, title: "Project demos", headerBackTitle: "Back", headerTintColor: C.scarletBright }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <SessionProvider>
        <StatusBar style="light" />
        <Navigator />
      </SessionProvider>
    </ThemeProvider>
  );
}

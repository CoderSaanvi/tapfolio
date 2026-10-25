import { Stack } from "expo-router";
import { OnboardingProvider } from "@/lib/onboarding";
import { C } from "@/lib/theme";

export default function OnboardingLayout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerTintColor: C.scarletBright,
          headerBackTitle: "Back",
          contentStyle: { backgroundColor: C.night },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="building" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </OnboardingProvider>
  );
}

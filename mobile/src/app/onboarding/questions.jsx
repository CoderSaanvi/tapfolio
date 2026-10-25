import { router } from "expo-router";
import { View } from "react-native";
import { Button, Field, H1, Screen, Sub } from "@/components/ui";
import { useOnboarding } from "@/lib/onboarding";

const FIELDS = [
  { key: "displayName", label: "Name to show on your card", placeholder: "Blank = name on your resume" },
  { key: "pronouns", label: "Pronouns", placeholder: "e.g. he/him (optional)" },
  { key: "targetRoles", label: "What roles are you going for?", placeholder: "e.g. Medical device R&D internships", long: true },
  { key: "building", label: "What are you building right now?", placeholder: "e.g. A tool that checks dance timing", long: true },
  { key: "tagline", label: "One line you want recruiters to remember", placeholder: "e.g. Let's build better healthcare together." },
  { key: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/you", kind: "url" },
  { key: "github", label: "GitHub", placeholder: "github.com/you", kind: "url" },
  { key: "email", label: "Email", placeholder: "Blank = the one on your resume", kind: "email" },
  { key: "phone", label: "Phone", placeholder: "Blank = the one on your resume", kind: "phone" },
];

export default function Questions() {
  const { answers, setAnswers } = useOnboarding();

  return (
    <Screen footer={<Button title="Build my Tapfolio" onPress={() => router.push("/onboarding/building")} />}>
      <View style={{ height: 40 }} />
      <H1>A few quick questions</H1>
      <Sub>All optional. Your answers shape how the portfolio is written.</Sub>
      {FIELDS.map((f) => (
        <Field
          key={f.key}
          label={f.label}
          value={answers[f.key]}
          onChangeText={(v) => setAnswers({ ...answers, [f.key]: v })}
          placeholder={f.placeholder}
          multiline={f.long}
          autoCapitalize={f.kind ? "none" : "sentences"}
          autoCorrect={!f.kind}
          keyboardType={f.kind === "email" ? "email-address" : f.kind === "phone" ? "phone-pad" : f.kind === "url" ? "url" : "default"}
        />
      ))}
    </Screen>
  );
}

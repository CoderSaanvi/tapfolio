import type { Config } from "tailwindcss";

/**
 * Dark theme in OSU scarlet and gray. Token names are shared by every screen:
 * `card` is a raised surface, `ink` is text, `wash` is a subtle fill.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0A0A0A",
        card: "#141414",
        scarlet: { DEFAULT: "#BA0C2F", deep: "#9A0A27", bright: "#EC4A62", tint: "rgba(186,12,47,.16)" },
        ink: { DEFAULT: "#F2F2F2", 2: "#9A9FA3" },
        osugray: "#A7B1B7",
        wash: "#1C1C1C",
        line: "rgba(255,255,255,.10)",
        "line-soft": "rgba(255,255,255,.06)",
      },
      fontFamily: {
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        body: ["var(--font-sora)", "system-ui", "sans-serif"],
        sora: ["var(--font-sora)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
        sys: ["var(--font-sora)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 30px 70px -30px rgba(0,0,0,.8)",
        save: "0 14px 30px -14px rgba(186,12,47,.6)",
      },
    },
  },
  plugins: [],
};

export default config;

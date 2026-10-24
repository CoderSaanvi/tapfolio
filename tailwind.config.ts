import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        scarlet: { DEFAULT: "#BA0C2F", deep: "#9A0A27", tint: "#FBEEF1" },
        ink: { DEFAULT: "#212325", 2: "#55595C" },
        osugray: "#A7B1B7",
        wash: "#F3F5F6",
        line: "rgba(167,177,183,.55)",
        "line-soft": "rgba(167,177,183,.35)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Arial Narrow", "Arial", "sans-serif"],
        body: ["var(--font-body)", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "Menlo", "monospace"],
        sys: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        card: "0 30px 70px -34px rgba(33,35,37,.4)",
        save: "0 14px 30px -14px rgba(186,12,47,.5)",
      },
    },
  },
  plugins: [],
};

export default config;

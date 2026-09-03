import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sky: {
          DEFAULT: "#79c8f5",
          light: "#a9ddf7",
          panel: "#eaf7ff",
        },
        ink: {
          DEFAULT: "#071a2b",
          blue: "#0b2842",
          muted: "#557083",
        },
        line: "rgba(7,26,43,0.15)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        "screen-2xl": "1400px",
      },
    },
  },
  plugins: [],
} satisfies Config;

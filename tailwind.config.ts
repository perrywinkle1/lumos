import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lumos: {
          // === DARK BACKGROUNDS ===
          dark: {
            950: "#030712",
            900: "#0a0f1a",
            850: "#0f1629",
            800: "#141d33",
            700: "#1e293b",
            600: "#334155",
            500: "#475569",
          },
          // === LIGHT BEAM COLORS ===
          beam: {
            white: "#f8fafc",
            warm: "#fef3c7",
            cyan: "#a5f3fc",
            soft: "#e0f2fe",
            gold: "#fcd34d",
          },
          // === TEXT COLORS ===
          text: {
            primary: "#f1f5f9",
            secondary: "#cbd5e1",
            muted: "#94a3b8",
            dim: "#64748b",
            illuminated: "#ffffff",
          },
          // === ACCENT COLORS ===
          accent: {
            primary: "#38bdf8",
            secondary: "#22d3ee",
            glow: "#7dd3fc",
            warm: "#fbbf24",
            success: "#34d399",
            error: "#f87171",
          },
          // === LEGACY (keeping for compatibility) ===
          orange: "#ff6719",
          "orange-light": "rgba(255, 103, 25, 0.1)",
          "orange-medium": "rgba(255, 103, 25, 0.4)",
          amber: "#f59e0b",
          yellow: "#fbbf24",
          gray: {
            50: "#fafafa",
            100: "#f5f5f5",
            200: "#e5e5e5",
            300: "#d4d4d4",
            400: "#a3a3a3",
            500: "#737373",
            600: "#525252",
            700: "#404040",
            800: "#262626",
            900: "#171717",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-spectral)", "Georgia", "serif"],
      },
      animation: {
        "beam-pulse": "beam-pulse 8s ease-in-out infinite",
        "beam-rotate": "beam-rotate 20s linear infinite",
        "float-mote-1": "float-mote-1 12s ease-in-out infinite",
        "float-mote-2": "float-mote-2 15s ease-in-out infinite",
        "float-mote-3": "float-mote-3 10s ease-in-out infinite",
        "shimmer": "shimmer 3s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "color-shift": "color-shift 20s ease infinite",
        "light-leak": "light-leak 0.3s ease forwards",
      },
      keyframes: {
        "beam-pulse": {
          "0%, 100%": { opacity: "0.6", transform: "scaleX(1)" },
          "50%": { opacity: "1", transform: "scaleX(1.02)" },
        },
        "beam-rotate": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "float-mote-1": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.3" },
          "25%": { transform: "translate(15px, -40px) scale(1.2)", opacity: "0.8" },
          "50%": { transform: "translate(-10px, -80px) scale(0.9)", opacity: "0.5" },
          "75%": { transform: "translate(20px, -120px) scale(1.1)", opacity: "0.7" },
        },
        "float-mote-2": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.4" },
          "20%": { transform: "translate(-20px, -30px) scale(0.8)", opacity: "0.6" },
          "40%": { transform: "translate(10px, -70px) scale(1.3)", opacity: "0.9" },
          "60%": { transform: "translate(-15px, -100px) scale(1)", opacity: "0.5" },
          "80%": { transform: "translate(5px, -140px) scale(0.9)", opacity: "0.3" },
        },
        "float-mote-3": {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)", opacity: "0.2" },
          "33%": { transform: "translate(25px, -50px) rotate(120deg)", opacity: "0.7" },
          "66%": { transform: "translate(-15px, -90px) rotate(240deg)", opacity: "0.4" },
        },
        "shimmer": {
          "0%, 100%": { opacity: "0.3", filter: "brightness(1)" },
          "50%": { opacity: "1", filter: "brightness(1.5)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(56, 189, 248, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(56, 189, 248, 0.6)" },
        },
        "color-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "light-leak": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      boxShadow: {
        "beam-soft": "0 0 60px rgba(248, 250, 252, 0.1), 0 0 120px rgba(56, 189, 248, 0.05)",
        "beam-glow": "0 0 30px rgba(56, 189, 248, 0.3), 0 0 60px rgba(56, 189, 248, 0.2)",
        "card-dark": "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3)",
        "card-dark-hover": "0 20px 40px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.1)",
        "btn-glow": "0 0 20px rgba(56, 189, 248, 0.4), 0 4px 16px rgba(56, 189, 248, 0.3)",
        "btn-glow-hover": "0 0 30px rgba(56, 189, 248, 0.5), 0 6px 24px rgba(56, 189, 248, 0.4), 0 0 60px rgba(56, 189, 248, 0.2)",
        "text-glow": "0 0 20px rgba(248, 250, 252, 0.3), 0 0 40px rgba(56, 189, 248, 0.2)",
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            maxWidth: "680px",
            color: theme("colors.lumos.text.secondary"),
            lineHeight: "1.75",
            fontSize: "1.125rem",
            fontFamily: theme("fontFamily.serif").join(", "),
            p: {
              marginTop: "1.5em",
              marginBottom: "1.5em",
            },
            h1: {
              fontFamily: theme("fontFamily.serif").join(", "),
              fontWeight: "700",
              tracking: "-0.02em",
              color: theme("colors.lumos.text.primary"),
            },
            h2: {
              fontFamily: theme("fontFamily.serif").join(", "),
              fontWeight: "700",
              tracking: "-0.01em",
              marginTop: "2em",
              color: theme("colors.lumos.text.primary"),
            },
            a: {
              color: theme("colors.lumos.accent.primary"),
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              fontWeight: "500",
              "&:hover": {
                color: theme("colors.lumos.accent.glow"),
              },
            },
            blockquote: {
              fontWeight: "400",
              fontStyle: "italic",
              color: theme("colors.lumos.text.muted"),
              borderLeftColor: theme("colors.lumos.accent.primary"),
              paddingLeft: "1.5rem",
            },
            code: {
              color: theme("colors.lumos.accent.secondary"),
              backgroundColor: theme("colors.lumos.dark.800"),
              borderRadius: "0.375rem",
              padding: "0.25rem 0.5rem",
            },
            pre: {
              backgroundColor: theme("colors.lumos.dark.850"),
              borderRadius: "0.75rem",
              border: "1px solid",
              borderColor: theme("colors.lumos.dark.700"),
            },
          },
        },
        lg: {
          css: {
            fontSize: "1.25rem",
            lineHeight: "1.8",
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;

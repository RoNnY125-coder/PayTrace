/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark mode warm grey surfaces (No pure black #000000)
        canvas: {
          DEFAULT: "#14151A",
          card: "#1E1F26",
          hover: "#26272E",
          border: "#2E2F38",
        },
        // Light mode surfaces
        light: {
          bg: "#F4F5F7",
          card: "#FFFFFF",
          hover: "#ECEEF1",
          border: "#E2E5E9",
        },
        // Single bold accent
        accent: {
          DEFAULT: "#9FE870",
          hover: "#B5F58D",
          subtle: "rgba(159, 232, 112, 0.12)",
          text: "#14151A",
        },
        // Status colors (small badges/icons only, never large fills)
        status: {
          settled: "#9FE870",
          settledSubtle: "rgba(159, 232, 112, 0.12)",
          delayed: "#F0B84B",
          delayedSubtle: "rgba(240, 184, 75, 0.12)",
          failed: "#E8615C",
          failedSubtle: "rgba(232, 97, 92, 0.12)",
          critical: "#F1483F",
          criticalSubtle: "rgba(241, 72, 63, 0.15)",
        },
        // Text tokens
        content: {
          primary: "#EDEDF0",      // soft off-white
          secondary: "#9B9CA6",    // mid-grey muted
          darkPrimary: "#14151A",  // light mode primary
          darkSecondary: "#6C6D77",// light mode secondary
        },

        // Backward compatibility mappings
        "primary": "#14151A",
        "on-primary": "#EDEDF0",
        "primary-container": "#9FE870",
        "on-primary-container": "#14151A",
        "surface": "#F4F5F7",
        "on-surface": "#14151A",
        "dark-bg": "#14151A",
        "dark-surface": "#1E1F26",
        "dark-surface-card": "#1E1F26",
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
      spacing: {
        "stack-xs": "8px",
        "stack-sm": "16px",
        "stack-md": "24px",
        "stack-lg": "32px",
        "stack-xl": "48px",
        "stack-2xl": "64px",
        "gutter": "32px",
        "panel-padding": "32px",
      },
      fontFamily: {
        "sans": ["Inter", "system-ui", "sans-serif"],
        "hero": ["Oswald", "Inter", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        "display": ["36px", { "lineHeight": "44px", "letterSpacing": "-0.03em", "fontWeight": "700" }],
        "heading": ["20px", { "lineHeight": "28px", "letterSpacing": "-0.015em", "fontWeight": "600" }],
        "body": ["15px", { "lineHeight": "24px", "letterSpacing": "-0.005em", "fontWeight": "400" }],
        "caption": ["12px", { "lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "500" }],
      }
    },
  },
  plugins: [],
}

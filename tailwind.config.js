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
        // Wise Design System Palette
        wise: {
          bright: "#9FE870",       // Iconic Wise neon lime
          brightHover: "#B5F58D",
          forest: "#163300",       // Deep Wise forest green
          forestHover: "#234D00",
          forestSubtle: "#EBF8E3",
          darkBg: "#0C110C",       // Wise deep charcoal/forest dark mode
          darkSurface: "#131A13",  // Dark card background
          darkCard: "#182218",     // Dark elevated container
          darkBorder: "#273827",   // Dark border
          lightBg: "#F4F5F7",      // Wise soft light canvas
          lightCard: "#FFFFFF",
          lightBorder: "#E2E5E9",
          textDark: "#163300",     // High-contrast primary text
          textMuted: "#596859",
        },
        "primary": "#163300",
        "on-primary": "#ffffff",
        "primary-container": "#9FE870",
        "on-primary-container": "#163300",
        "inverse-primary": "#9FE870",
        "secondary": "#2D5A0F",
        "on-secondary": "#ffffff",
        "secondary-container": "#EBF8E3",
        "on-secondary-container": "#163300",
        "surface": "#F4F5F7",
        "on-surface": "#163300",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#F4F5F7",
        "surface-container": "#ECEEF1",
        "surface-container-high": "#E5E8EB",
        "dark-bg": "#0C110C",
        "dark-surface": "#131A13",
        "dark-surface-card": "rgba(19, 26, 19, 0.75)",
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px"
      },
      spacing: {
        "stack-xs": "4px",
        "stack-sm": "8px",
        "stack-md": "16px",
        "stack-lg": "24px",
        "stack-xl": "32px",
        "gutter": "24px",
        "panel-padding": "24px",
        "margin-screen": "32px"
      },
      fontFamily: {
        "sans": ["Inter", "system-ui", "sans-serif"],
        "hero": ["Oswald", "Google Sans", "Raleway", "sans-serif"],
        "oswald": ["Oswald", "sans-serif"],
        "google-sans": ["'Google Sans'", "sans-serif"],
        "raleway": ["Raleway", "sans-serif"],
        "caacupe": ["'Caacupe One'", "cursive"],
        "body-sm": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-xl": ["Inter", "sans-serif"],
        "mono": ["JetBrains Mono", "monospace"],
        "label-sm": ["JetBrains Mono", "monospace"],
        "label-md": ["JetBrains Mono", "monospace"],
        "tabular-nums": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "body-sm": ["12px", { "lineHeight": "16px", "fontWeight": "400" }],
        "body-md": ["13px", { "lineHeight": "18px", "fontWeight": "400" }],
        "body-lg": ["15px", { "lineHeight": "22px", "fontWeight": "400" }],
        "headline-md": ["18px", { "lineHeight": "24px", "letterSpacing": "-0.01em", "fontWeight": "500" }],
        "headline-lg": ["22px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-xl": ["28px", { "lineHeight": "36px", "letterSpacing": "-0.02em", "fontWeight": "600" }],
        "label-sm": ["11px", { "lineHeight": "14px", "letterSpacing": "0.02em", "fontWeight": "500" }],
        "label-md": ["12px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500" }],
        "tabular-nums": ["13px", { "lineHeight": "18px", "letterSpacing": "0px", "fontWeight": "400" }]
      }
    },
  },
  plugins: [],
}

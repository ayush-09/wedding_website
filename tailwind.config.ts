import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Indigo-dominant Shiva-Parvati palette.
        // "ink" and "wine" (legacy names from earlier theme) now both point to
        // indigo shades so the whole site reads royal-blue + cream.
        ink: "#0F0F26",        // deepest indigo (darkest surface)
        wine: "#1B1B3A",       // royal indigo (primary accent)
        cream: "#F5E6C9",      // temple cream (base)
        bone: "#ECD8A8",       // slightly deeper cream
        ash: "#F3EADA",        // ash/bhasma for dark-on-light text
        bhasma: "#D8CDAE",

        // Bright accents
        gold: "#D4A84B",
        goldsoft: "#E4D4A8",
        saffron: "#E85A2F",
        saffronLight: "#F39C5B",

        // Semantic blues
        indigo: "#1B1B3A",
        indigoDeep: "#0F0F26",
        neel: "#2D4263",
        royal: "#2A1B5E",
        twilight: "#281C50",

        // Legacy / accent reds — kept as indigo aliases so existing classes still resolve
        crimson: "#1B1B3A",
        rose: "#B9A7D1",       // muted lavender (used only for subtle tint)
        rosedeep: "#8670A8",
        moss: "#4A5D3F",

        rudraksha: "#3A1810",
        kailash: "#D9E4EA",
      },
      fontFamily: {
        display: ["var(--font-display)", "'DM Serif Display'", "Georgia", "serif"],
        script: ["var(--font-script)", "'Allura'", "'Parisienne'", "cursive"],
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        sanskrit: ["var(--font-sanskrit)", "'Noto Serif Devanagari'", "serif"],
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        drawLine: {
          "0%": { strokeDashoffset: "1000" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      animation: {
        shimmer: "shimmer 3s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        drawLine: "drawLine 2.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#06070a",
        surface: "#10141a",
        surfaceAlt: "#151b23",
        line: "#232b36",
        accent: "#7dd3fc",
        accentStrong: "#38bdf8",
        text: "#f3f6fb",
        textMuted: "#9ba7b7",
        success: "#86efac"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(125, 211, 252, 0.12), 0 20px 60px rgba(0, 0, 0, 0.32)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)"
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;

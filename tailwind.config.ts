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
        cyber: {
          bg: "#080808",
          card: "#0f0f0c",
          border: "#f59e0b", // Amber text/borders
          darkborder: "rgba(245, 158, 11, 0.25)",
          text: "#f59e0b",
          subtext: "rgba(245, 158, 11, 0.6)",
          red: "#ef4444",
          green: "#22c55e",
          yellow: "#eab308",
        }
      },
      fontFamily: {
        mono: ["var(--font-mono)", "Courier New", "Courier", "monospace"],
      },
      boxShadow: {
        'cyber-glow': '0 0 10px rgba(245, 158, 11, 0.2)',
        'cyber-glow-strong': '0 0 20px rgba(245, 158, 11, 0.45)',
        'cyber-glow-red': '0 0 10px rgba(239, 68, 68, 0.35)',
        'cyber-glow-green': '0 0 10px rgba(34, 197, 94, 0.35)',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        base: {
          night: "#05070d",
          panel: "#0c111b",
          card: "#111826",
          line: "#233044",
          blue: "#3b82f6",
          cyan: "#22d3ee",
          green: "#34d399",
          amber: "#f59e0b"
        }
      },
      boxShadow: {
        card: "0 18px 60px rgba(0, 0, 0, 0.26)"
      }
    }
  },
  plugins: []
};

export default config;

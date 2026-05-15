import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F2F1EC",
        surface: "#FFFFFF",
        ink: "#141416",
        muted: "#6B6B70",
        subtle: "#9A9A9E",
        line: "#E8E6DF",
        accent: "#E85A4F",
        gold: "#B08A3A",
        navy: "#16161C",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-lora)", "Georgia", "serif"],
        malayalam: ["var(--font-malayalam)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px rgba(20, 20, 22, 0.06)",
        float: "0 10px 40px rgba(20, 20, 22, 0.12)",
      },
      borderRadius: {
        card: "20px",
      },
    },
  },
  plugins: [],
};

export default config;

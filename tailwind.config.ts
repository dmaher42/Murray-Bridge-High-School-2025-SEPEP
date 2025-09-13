import type { Config } from 'tailwindcss';

export default {
  content: ["./index.html", "./**/*.html", "./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {
      colors: {
        mbhs: {
          navy: "#0F172A",
          blue: "#2563EB",
          gold: "#F59E0B",
          white: "#FFFFFF",
        },
        // Neighbourhood / data colours
        hood: {
          kungari: "#2563EB",
          nori: "#16A34A",
          pondi: "#CA8A04",
          wirakuthi: "#DC2626",
        },
        // (Temporary alias to avoid breakage if code still uses "house")
        house: {
          blue: "#2563EB",
          green: "#16A34A",
          yellow: "#CA8A04",
          red: "#DC2626",
        },
        success: "#16A34A",
        warning: "#F59E0B",
        danger: "#DC2626",
      },
      boxShadow: { card: "0 8px 30px rgb(2 8 23 / 0.08)" },
      borderRadius: { '2xl': "1.25rem" },
    },
  },
  plugins: [],
} satisfies Config;

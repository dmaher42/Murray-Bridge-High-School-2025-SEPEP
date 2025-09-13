import type { Config } from 'tailwindcss';

export default {
  content: ["./index.html", "./**/*.html", "./src/**/*.{ts,tsx,js}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#eef2ff",100:"#e0e7ff",400:"#6366f1",600:"#4f46e5",800:"#3730a3" },
        brandBase: "#2563eb",
        accent:{ 50:"#fff7ed",100:"#ffedd5",500:"#f59e0b",600:"#d97706" },
        success:"#16a34a", warning:"#f59e0b", danger:"#dc2626",
        house: { blue:"#2563eb", red:"#dc2626", green:"#16a34a", yellow:"#ca8a04" }
      },
      borderRadius: { xl:"1rem", '2xl':"1.25rem" },
      boxShadow: { card:"0 8px 30px rgb(2 8 23 / 0.06)" }
    },
  },
  plugins: [],
} satisfies Config;

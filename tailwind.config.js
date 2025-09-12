import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pocket: {
          light: "#f3f5f7",
          DEFAULT: "#ef4056",
          dark: "#d6243e"
        },
        brand: colors.emerald,
        accent: colors.teal
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"]
      }
    }
  },
  plugins: []
};

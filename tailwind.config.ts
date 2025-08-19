import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#000000"
        }
      },
      maxWidth: {
        prose: "72ch"
      }
    }
  },
  plugins: []
} satisfies Config;

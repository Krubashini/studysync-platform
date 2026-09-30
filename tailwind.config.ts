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
        duo: {
          green: "#58CC02",
          "green-dark": "#46A302",
          "feather-green": "#78D933",
          blue: "#1CB0F6",
          "blue-dark": "#1899D6",
          orange: "#FF9600",
          "orange-dark": "#E08500",
          red: "#EA2B2B",
          "red-dark": "#D12424",
          yellow: "#FFC800",
          "yellow-dark": "#E5B400",
          purple: "#CE82FF",
          "purple-dark": "#A557D8",
          gray: "#AFAFAF",
          "gray-light": "#E5E5E5",
          "gray-bg": "#F7F7F7",
          charcoal: "#4B4B4B",
          dark: "#3C3C3C",
        },
      },
      borderWidth: {
        "3": "3px",
      },
      boxShadow: {
        "duo-sm": "0 2px 0 0 #E5E5E5",
        "duo": "0 4px 0 0 #E5E5E5",
        "duo-green": "0 4px 0 0 #46A302",
        "duo-blue": "0 4px 0 0 #1899D6",
        "duo-orange": "0 4px 0 0 #E08500",
        "duo-red": "0 4px 0 0 #D12424",
        "duo-purple": "0 4px 0 0 #A557D8",
        "duo-yellow": "0 4px 0 0 #E5B400",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

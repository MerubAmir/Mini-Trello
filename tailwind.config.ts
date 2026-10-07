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
        ink: "#17211b",
        field: "#f6f7f4",
        line: "#d9ded4",
        moss: "#3f6f56",
        coral: "#cf5f45",
        amber: "#d89b3a",
        sky: "#4d83a8"
      },
      boxShadow: {
        soft: "0 16px 42px rgba(23, 33, 27, 0.11)"
      }
    }
  },
  plugins: []
};

export default config;

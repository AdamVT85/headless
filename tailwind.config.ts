import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Vintage Travel Brand Colors
      colors: {
        // Brand palette - Mediterranean inspired
        'vintage-green': '#2D3E35', // Main brand color from design
        'vintage-gold': '#C5A065', // Accent gold from design
        'vintage-cream': '#F5F5F0', // Light cream background
        cream: '#F9F7F2', // Background color from design
        terracotta: {
          DEFAULT: "#C06C54",
          50: "#F9EBE8",
          100: "#F3D7D1",
          200: "#E7AFA3",
          300: "#DB8775",
          400: "#CF5F47",
          500: "#C06C54",
          600: "#9A5743",
          700: "#734232",
          800: "#4D2C21",
          900: "#261610",
        },
        olive: {
          DEFAULT: "#5F6B4E",
          50: "#F0F2ED",
          100: "#E1E5DB",
          200: "#C3CBB7",
          300: "#A5B193",
          400: "#87976F",
          500: "#5F6B4E",
          600: "#4C563E",
          700: "#39402F",
          800: "#262B1F",
          900: "#131510",
        },
        clay: {
          DEFAULT: "#E8E4DD",
          50: "#FFFFFF",
          100: "#FAF9F7",
          200: "#F2F0EB",
          300: "#E8E4DD",
          400: "#D9D3C7",
          500: "#C9C2B1",
          600: "#B4A995",
          700: "#998D75",
          800: "#7A705C",
          900: "#5B5343",
        },
        stone: {
          DEFAULT: "#A8A29E",
          50: "#F5F4F3",
          100: "#EAE8E7",
          200: "#D6D1CF",
          300: "#C1BAB7",
          400: "#ADA39F",
          500: "#A8A29E",
          600: "#8D847F",
          700: "#6F6760",
          800: "#514A44",
          900: "#332D28",
        },
        palm: {
          DEFAULT: "#4A7A45",
          50: "#EDF5EC",
          100: "#DBEBD9",
          200: "#B7D7B3",
          300: "#93C38D",
          400: "#6FAF67",
          500: "#4A7A45",
          600: "#3B6237",
          700: "#2C4929",
          800: "#1E311C",
          900: "#0F180E",
        },
        soleil: {
          DEFAULT: "#D4A017",
          50: "#FBF5E5",
          100: "#F7EBCB",
          200: "#EFD797",
          300: "#E7C363",
          400: "#DFAF2F",
          500: "#D4A017",
          600: "#AA8012",
          700: "#7F600E",
          800: "#554009",
          900: "#2A2005",
        },
        // Keep existing CSS variable support
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // Typography
      fontFamily: {
        serif: ["var(--font-crimson-pro)", "Crimson Pro", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      // Layout utilities
      aspectRatio: {
        "3/2": "3 / 2",
      },
    },
  },
  plugins: [],
};
export default config;

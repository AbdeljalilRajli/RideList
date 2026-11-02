/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  mode: "jit",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        // Legacy tokens kept for compatibility
        "black-100": "#2B2C35",
        "primary-blue": {
          DEFAULT: "#3730a3",
          100: "#F5F8FF",
        },
        "secondary-orange": "#f79761",
        "light-white": {
          DEFAULT: "rgba(59,60,152,0.03)",
          100: "rgba(59,60,152,0.02)",
        },
        grey: "#747A88",
        // New design system tokens
        canvas: "#F8F8FB",
        "surface-white": "#FFFFFF",
        "surface-subtle": "#F1F1F6",
        "surface-accent": "#EEEDF9",
        indigo: {
          DEFAULT: "#3730A3",
          hover: "#312E81",
          dark: "#1E1B4B",
        },
        ink: {
          DEFAULT: "#0F0F1A",
          secondary: "#6B7280",
          muted: "#9CA3AF",
        },
        hairline: "#E5E7EB",
        success: "#16A34A",
        "success-light": "#DCFCE7",
        error: "#BA1A1A",
      },
      backgroundImage: {
        pattern: "url('/pattern.png')",
        "hero-bg": "url('/hero-bg.png')",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 1s ease-in-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      boxShadow: {
        card: "0px 8px 24px -4px rgba(15,15,26,0.04)",
        "card-hover": "0px 16px 36px -6px rgba(15,15,26,0.08)",
        dock: "0px 20px 40px -10px rgba(15,15,26,0.10)",
        navbar: "0px 1px 8px rgba(15,15,26,0.06)",
      },
    },
  },
  plugins: [],
};

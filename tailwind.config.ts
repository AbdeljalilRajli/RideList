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
        sans: ['"Work Sans"', "sans-serif"],
        heading: ['"Work Sans"', "sans-serif"],
        "work-sans": ['"Work Sans"', "sans-serif"],
        body: ['"Work Sans"', "sans-serif"],
      },
      colors: {
        // Figma template primary brand colors
        brand: {
          DEFAULT: "#5937E0",
          hover: "#4A2CC7",
          light: "#EEEDF9",
          dark: "#1E1B4B",
        },
        "figma-purple": {
          DEFAULT: "#5937E0",
          hover: "#4A2CC7",
          light: "#EEEDF9",
        },
        // Legacy tokens kept for compatibility
        "black-100": "#2B2C35",
        "primary-blue": {
          DEFAULT: "#5937E0",
          100: "#F5F8FF",
        },
        "secondary-orange": "#f79761",
        "light-white": {
          DEFAULT: "rgba(89,55,224,0.03)",
          100: "rgba(89,55,224,0.02)",
        },
        grey: "#747A88",
        // Design system surface tokens
        canvas: "#F8F8FB",
        "surface-white": "#FFFFFF",
        "surface-subtle": "#F1F1F6",
        "surface-accent": "#EEEDF9",
        indigo: {
          DEFAULT: "#5937E0",
          hover: "#4A2CC7",
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
        pill: "50px",
        card: "20px",
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
        card: "0px 4px 20px rgba(0, 0, 0, 0.06)",
        "card-hover": "0px 12px 30px rgba(89, 55, 224, 0.12)",
        dock: "0px 20px 40px -10px rgba(15,15,26,0.10)",
        navbar: "0px 1px 8px rgba(15,15,26,0.06)",
      },
    },
  },
  plugins: [],
};

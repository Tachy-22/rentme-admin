import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // primary: {
        //   DEFAULT: '#171717', // Very dark gray
        //   50: '#404040',
        //   100: '#333333',
        //   200: '#262626',
        //   300: '#1f1f1f',
        //   400: '#171717',
        //   500: '#141414', // Main dark
        //   600: '#0f0f0f',
        //   700: '#0a0a0a',
        //   800: '#050505',
        //   900: '#000000',
        // },

        primary: {
          DEFAULT: "#5a68fa",
          "50": "#edf2ff",
          "100": "#dee8ff",
          "200": "#c4d4ff",
          "300": "#a0b7ff",
          "400": "#7a8eff",
          "500": "#5a68fa",
          "600": "#3c3cef",
          "700": "#2d2bca",
          "800": "#2929aa",
          "900": "#292c86",
          "950": "#18184e",
        },

        background: {
          DEFAULT: "#fffff", // Dark background
          dark: "#fffff", // Darker background
          stone: "#1a1a1a", // Dark stone
        },
        text: {
          DEFAULT: "#ffffff", // White text
          light: "#f5f5f5", // Light text
          muted: "#a3a3a3", // Muted gray
        },
      },
    },
  },
 // plugins: [require("tailwindcss-animate")],
};
export default config

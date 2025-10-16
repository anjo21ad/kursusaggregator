import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF6A3D',
        'primary-dark': '#E2572D',
        secondary: '#7E6BF1',
        background: '#0F0F1A',
        card: '#1C1C2E',
        'text-light': '#F5F5F7',
        'text-muted': '#A0A0B2',
        accent: '#3ABEFF',
        success: '#38D39F',
        // Dark theme colors
        'dark-bg': '#0F0F1A',
        'dark-card': '#1C1C2E',
        'dark-border': '#2A2A3E',
        'dark-hover': '#252538',
        'dark-text-secondary': '#A0A0B2'
      },
    },
  },
  plugins: [],
} satisfies Config;
